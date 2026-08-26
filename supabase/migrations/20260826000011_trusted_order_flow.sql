-- Trusted public-release flows. Orders and reward eligibility are server-owned.

create or replace function public.create_order(p_service text, p_items jsonb default '[]')
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_script public.gag_scripts;
  v_order public.orders;
  v_seed bigint;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_service not in ('food', 'ride', 'parcel', 'mart', 'date') then
    raise exception 'INVALID_SERVICE';
  end if;
  if jsonb_typeof(p_items) <> 'array' or pg_column_size(p_items) > 65536 then
    raise exception 'INVALID_ITEMS';
  end if;

  select g.* into v_script
    from public.gag_scripts g
   where g.active and (g.service = p_service or g.service is null)
   order by -ln(1.0 - random()) / greatest(g.weight, 1) asc
   limit 1;
  if not found then raise exception 'NO_SCRIPT_AVAILABLE'; end if;
  v_seed := floor(random() * 2147483647)::bigint;

  insert into public.orders (user_id, service, items_json, script_id, seed)
  values (v_uid, p_service, p_items, v_script.id, v_seed)
  returning * into v_order;
  return v_order;
end $$;

revoke all on function public.create_order(text, jsonb) from public, anon;
grant execute on function public.create_order(text, jsonb) to authenticated;

create or replace function public.complete_order_failure(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders;
  v_timeline jsonb;
  v_duration integer;
  v_finale text;
  v_trigger text;
  v_prior_failures integer;
  v_xp integer;
  v_voucher public.vouchers;
  v_context jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select o.* into v_order
    from public.orders o
   where o.id = p_order_id and o.user_id = v_uid
   for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;

  if v_order.status = 'failed_hilariously' then
    select v.* into v_voucher
      from public.vouchers v
     where v.user_id = v_uid and v.context ->> 'order_id' = p_order_id::text
     order by v.granted_at desc limit 1;
    return jsonb_build_object('voucher', to_jsonb(v_voucher), 'rate_limited', false);
  end if;
  if v_order.status <> 'tracking' then raise exception 'ORDER_NOT_TRACKING'; end if;

  select g.timeline into v_timeline from public.gag_scripts g where g.id = v_order.script_id;
  v_duration := greatest(coalesce((v_timeline ->> 'duration_s')::integer, 0), 0);
  if now() < v_order.created_at + make_interval(secs => v_duration) then
    raise exception 'ORDER_STILL_TRACKING';
  end if;

  select e ->> 'kind' into v_finale
    from jsonb_array_elements(coalesce(v_timeline -> 'events', '[]'::jsonb)) e
   where e ->> 'type' = 'finale'
   order by coalesce((e ->> 't')::numeric, 0) desc
   limit 1;
  select count(*) into v_prior_failures
    from public.orders o
   where o.user_id = v_uid and o.status = 'failed_hilariously' and o.id <> p_order_id;

  v_trigger := case when v_order.service = 'date' then 'date_ghosted' else 'order_failed' end;
  v_xp := case when v_order.service = 'date' then 40 else 25 end;
  v_context := jsonb_build_object(
    'order_id', p_order_id,
    'service', v_order.service,
    'finale_type', coalesce(v_finale, 'lost'),
    'nth_fail', v_prior_failures + 1
  );

  update public.orders set status = 'failed_hilariously' where id = p_order_id;
  update public.profiles
     set loyalty_xp = loyalty_xp + v_xp,
         tier = case
           when loyalty_xp + v_xp >= 1500 then 'vip'
           when loyalty_xp + v_xp >= 600 then 'platinum'
           when loyalty_xp + v_xp >= 200 then 'gold'
           else 'silver'
         end
   where id = v_uid;

  begin
    select * into v_voucher from public.grant_voucher(v_trigger, v_context);
  exception when raise_exception then
    if sqlerrm = 'RATE_LIMITED' then
      return jsonb_build_object('voucher', null, 'rate_limited', true);
    end if;
    raise;
  end;
  return jsonb_build_object('voucher', to_jsonb(v_voucher), 'rate_limited', false);
end $$;

revoke all on function public.complete_order_failure(uuid) from public, anon;
grant execute on function public.complete_order_failure(uuid) to authenticated;
