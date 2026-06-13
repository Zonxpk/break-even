-- Tie-in registrations arrive only through the tiein-submit Edge Function
-- (service role bypasses RLS). No client policies and no client grants at all
-- (auto_expose_new_tables = false means absence of grants = locked).
create table public.tiein_requests (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  contact      text not null,
  merch_desc   text not null,
  budget_range text not null,
  created_at   timestamptz not null default now()
);

alter table public.tiein_requests enable row level security;
-- intentionally: zero policies, zero anon/authenticated grants

-- Edge Function (service_role) needs INSERT to write tie-in submissions
grant insert on public.tiein_requests to service_role;
