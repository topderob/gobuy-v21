-- Supabase setup for GoBuy v21: addresses table + RLS policies

-- Extensions (gen_random_uuid)
create extension if not exists pgcrypto;

-- Table
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  address text not null,
  city text not null,
  zip text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for user lookups
create index if not exists addresses_user_id_idx on public.addresses (user_id);

-- Row Level Security
alter table public.addresses enable row level security;

-- Policies (replace if existing)
-- Allow users to see only their own addresses
create policy addresses_select_own on public.addresses
  for select
  using (auth.uid() = user_id);

-- Allow users to insert their own addresses
create policy addresses_insert_own on public.addresses
  for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own addresses
create policy addresses_update_own on public.addresses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own addresses
create policy addresses_delete_own on public.addresses
  for delete
  using (auth.uid() = user_id);

-- Optional: Ensure a single default per user (enforced via trigger)
-- Uncomment if you want strong consistency; otherwise app sets defaults.
-- create or replace function public.ensure_single_default()
-- returns trigger language plpgsql as $$
-- begin
--   if NEW.is_default then
--     update public.addresses set is_default = false where user_id = NEW.user_id and id <> NEW.id;
--   end if;
--   return NEW;
-- end;
-- $$;
-- drop trigger if exists addresses_single_default on public.addresses;
-- create trigger addresses_single_default before insert or update on public.addresses
--   for each row execute function public.ensure_single_default();
