-- Public-release hardening: reward state is server-owned.
-- Clients keep profile reads + nickname updates, but cannot mint eligibility.
revoke update (loyalty_xp, tier)
  on public.profiles from authenticated;

-- Order lifecycle and creation now move behind trusted RPCs.
revoke insert (user_id, service, items_json, script_id, seed)
  on public.orders from authenticated;
revoke update (status)
  on public.orders from authenticated;

-- Raw voucher grants accept condition context, so they are internal-only.
revoke execute on function public.grant_voucher(text, jsonb)
  from authenticated;
