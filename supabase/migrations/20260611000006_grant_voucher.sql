-- The prize draw (spec §9). SECURITY DEFINER so it can write vouchers and
-- campaign quotas that clients cannot. Quota enforcement is atomic: the
-- conditional UPDATE either claims a slot or the loop moves to the next
-- candidate. If nothing matches, the evergreen fallback fires (spec §13).
create or replace function public.grant_voucher(p_trigger text, p_context jsonb default '{}')
returns public.vouchers
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_camp      record;
  v_voucher   public.vouchers;
  v_tier_rank integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_trigger not in ('order_failed', 'date_ghosted', 'tier_up', 'signup', 'share') then
    raise exception 'INVALID_TRIGGER';
  end if;

  if pg_column_size(p_context) > 8192 then
    raise exception 'CONTEXT_TOO_LARGE';
  end if;

  select array_position(array['silver','gold','platinum','vip'], p.tier)
    into v_tier_rank
    from public.profiles p where p.id = v_uid;

  for v_camp in
    select c.*
      from public.voucher_campaigns c
     where c.status = 'active'
       and c.is_fallback = false
       and c.trigger_event = p_trigger
       and (c.quota_total is null or c.quota_used < c.quota_total)
       and (c.active_from is null or now() >= c.active_from)
       and (c.active_to   is null or now() <= c.active_to)
       and (c.conditions ->> 'service' is null
            or c.conditions ->> 'service' = p_context ->> 'service')
       and (c.conditions ->> 'finale_type' is null
            or c.conditions ->> 'finale_type' = p_context ->> 'finale_type')
       and (c.conditions ->> 'persona_rarity' is null
            or c.conditions ->> 'persona_rarity' = p_context ->> 'persona_rarity')
       and (c.conditions ->> 'min_tier' is null
            or array_position(array['silver','gold','platinum','vip'],
                              c.conditions ->> 'min_tier') <= v_tier_rank)
       and (c.conditions ->> 'nth_fail' is null
            or (coalesce(p_context ->> 'nth_fail', '0') ~ '^[0-9]+$'
                and (p_context ->> 'nth_fail')::integer >= (c.conditions ->> 'nth_fail')::integer))
       and (c.conditions -> 'day_of_week' is null
            or c.conditions -> 'day_of_week' @> to_jsonb(extract(isodow from now() at time zone 'Asia/Bangkok')::integer))
       and (c.conditions -> 'hour_range' is null
            or (extract(hour from now() at time zone 'Asia/Bangkok')::integer >= (c.conditions -> 'hour_range' ->> 0)::integer
                and extract(hour from now() at time zone 'Asia/Bangkok')::integer <  (c.conditions -> 'hour_range' ->> 1)::integer))
       and (coalesce((c.conditions ->> 'first_time_event')::boolean, false) = false
            or not exists (
                 select 1 from public.vouchers v
                   join public.voucher_campaigns vc on vc.id = v.campaign_id
                  where v.user_id = v_uid and vc.trigger_event = p_trigger
                    and vc.is_fallback = false))
       and (c.per_user_max is null
            or (select count(*) from public.vouchers v
                 where v.user_id = v_uid and v.campaign_id = c.id) < c.per_user_max)
       and (c.cooldown_hours is null
            or not exists (
                 select 1 from public.vouchers v
                  where v.user_id = v_uid and v.campaign_id = c.id
                    and v.granted_at > now() - make_interval(hours => c.cooldown_hours)))
     order by c.priority desc,
              -ln(1.0 - random()) / greatest(c.weight, 1) asc   -- weighted random within priority
  loop
    update public.voucher_campaigns
       set quota_used = quota_used + 1
     where id = v_camp.id
       and (quota_total is null or quota_used < quota_total);
    if found then
      insert into public.vouchers (user_id, campaign_id, code, status, context)
      values (v_uid, v_camp.id,
              case v_camp.code_mode
                when 'none'   then null
                when 'static' then v_camp.static_code
                else 'WHEN-' || upper(substr(md5(gen_random_uuid()::text), 1, 12))
              end,
              'active', p_context)
      returning * into v_voucher;
      return v_voucher;
    end if;
  end loop;

  -- evergreen fallback: the payoff never silently fails
  select c.* into v_camp
    from public.voucher_campaigns c
   where c.is_fallback and c.status = 'active'
   order by c.priority desc
   limit 1;
  if v_camp.id is null then
    raise exception 'NO_CAMPAIGN_AVAILABLE';
  end if;

  -- Honor the fallback campaign's own brakes when ops set them in Studio.
  if v_camp.per_user_max is not null
     and (select count(*) from public.vouchers v
           where v.user_id = v_uid and v.campaign_id = v_camp.id) >= v_camp.per_user_max then
    raise exception 'RATE_LIMITED';
  end if;
  if v_camp.cooldown_hours is not null
     and exists (select 1 from public.vouchers v
                  where v.user_id = v_uid and v.campaign_id = v_camp.id
                    and v.granted_at > now() - make_interval(hours => v_camp.cooldown_hours)) then
    raise exception 'RATE_LIMITED';
  end if;

  insert into public.vouchers (user_id, campaign_id, code, status, context)
  values (v_uid, v_camp.id,
          'WHEN-' || upper(substr(md5(gen_random_uuid()::text), 1, 12)),
          'active', p_context)
  returning * into v_voucher;
  return v_voucher;
end $$;

revoke all on function public.grant_voucher(text, jsonb) from public, anon;
grant execute on function public.grant_voucher(text, jsonb) to authenticated;

-- Code lookup for redemption desks. NOT unique: static campaigns share a code.
-- 48-bit unique-mode codes make collisions improbable (~50% at 16M vouchers).
create index vouchers_code_idx on public.vouchers (code) where code is not null;
