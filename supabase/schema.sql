-- Bubble Town — social layer schema (Phase 1: accounts + profile photo + cloud save)
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- Safe to re-run.
--
-- IMPORTANT one-time dashboard setting:
--   Auth → Sign In / Providers → Email → turn OFF "Confirm email".
--   Kids log in with a screenname mapped to a synthetic address they never see,
--   so there is no inbox to confirm. (Password reset is handled separately, to the
--   parent email, in a later step.)

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles: one row per account (one child). `screenname` is the login identity;
-- `parent_email` is just an attribute, so the SAME parent email can sit on several
-- siblings' accounts.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  screenname    text not null check (char_length(screenname) between 2 and 20),
  -- normalised, case/space/punctuation-insensitive key — MUST match screennameKey()
  -- in src/lib/supabaseConfig.js. Drives the synthetic login email + uniqueness.
  screenname_key text generated always as (lower(regexp_replace(screenname, '[^a-zA-Z0-9]', '', 'g'))) stored,
  parent_email  text not null,
  friend_code   text not null,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

create unique index if not exists profiles_screenname_key_idx on public.profiles (screenname_key);
create unique index if not exists profiles_friend_code_idx     on public.profiles (friend_code);
create index        if not exists profiles_parent_email_idx    on public.profiles (lower(parent_email));

alter table public.profiles enable row level security;

drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- worlds: each account's saved game state (the same JSON the game stores locally).
-- This powers cloud-save now and read-only "visit a friend's world" later.
create table if not exists public.worlds (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.worlds enable row level security;

drop policy if exists "worlds owner all" on public.worlds;
create policy "worlds owner all" on public.worlds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- (friends-can-read SELECT policy is added in Phase 3.)

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage: public bucket for the circular character-head avatars.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Each user may write only files under a folder named with their own uid.
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars owner write" on storage.objects;
create policy "avatars owner write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
