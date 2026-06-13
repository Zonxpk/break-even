-- Merch claims (spec §10): consume vouchers + decrement stock + mint code in
-- one transaction. Row locks (FOR UPDATE) prevent overselling and double-spend.
create or replace function public.claim_merch(p_item_id uuid)
returns public.claims
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid         uuid := auth.uid();
  v_item        record;
  v_voucher_ids uuid[];
  v_claim       public.claims;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_item
    from public.merch_items
   where id = p_item_id and active
   for update;
  if not found then
    raise exception 'ITEM_NOT_FOUND';
  end if;
  if v_item.stock <= 0 then
    raise exception 'OUT_OF_STOCK';
  end if;

  select array_agg(id) into v_voucher_ids
    from (
      select id from public.vouchers
       where user_id = v_uid
         and status = 'active'
         and (v_item.required_campaign_id is null
              or campaign_id = v_item.required_campaign_id)
       order by granted_at asc
       limit v_item.voucher_price
       for update
    ) s;
  if coalesce(array_length(v_voucher_ids, 1), 0) < v_item.voucher_price then
    raise exception 'INSUFFICIENT_VOUCHERS';
  end if;

  update public.vouchers set status = 'spent' where id = any (v_voucher_ids);
  update public.merch_items set stock = stock - 1 where id = p_item_id;

  insert into public.claims (user_id, merch_item_id, voucher_ids, redemption_code, status)
  values (v_uid, p_item_id, v_voucher_ids,
          'WHEN-' || upper(substr(md5(gen_random_uuid()::text), 1, 12)),
          'claimed')
  returning * into v_claim;
  return v_claim;
end $$;

-- Brand staff marks a claim redeemed at physical pickup.
create or replace function public.redeem_claim(p_code text)
returns public.claims
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_claim public.claims;
  v_brand uuid;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select c.* into v_claim
    from public.claims c
   where c.redemption_code = p_code
   for update;
  if not found then
    raise exception 'CLAIM_NOT_FOUND';
  end if;

  select s.brand_id into v_brand
    from public.merch_items mi
    join public.shops s on s.id = mi.shop_id
   where mi.id = v_claim.merch_item_id;

  if not exists (select 1 from public.brand_members bm
                  where bm.user_id = v_uid and bm.brand_id = v_brand) then
    raise exception 'NOT_BRAND_MEMBER';
  end if;
  if v_claim.status <> 'claimed' then
    raise exception 'ALREADY_REDEEMED';
  end if;

  update public.claims set status = 'redeemed'
   where id = v_claim.id
  returning * into v_claim;
  return v_claim;
end $$;

revoke all on function public.claim_merch(uuid)  from public, anon;
revoke all on function public.redeem_claim(text) from public, anon;
grant execute on function public.claim_merch(uuid)  to authenticated;
grant execute on function public.redeem_claim(text) to authenticated;

-- Query shapes: "my claims" (wallet) and per-item lookups (brand desk stats).
create index claims_user_idx on public.claims (user_id, created_at desc);
create index claims_item_idx on public.claims (merch_item_id);
