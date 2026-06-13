-- Profiles: one row per auth user. Loyalty tier is client-maintained in v1
-- (spec §15: modest client-trust accepted; tier-gated grants re-check this row).
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nickname    text,
  loyalty_xp  integer not null default 0,
  tier        text not null default 'silver'
              check (tier in ('silver', 'gold', 'platinum', 'vip')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Grant permissions for testing/admin
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.profiles to anon;

create policy "profiles owner select" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles owner update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Auto-create a profile on signup; nickname from signup metadata when present.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data ->> 'nickname');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
