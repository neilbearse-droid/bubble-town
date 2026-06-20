-- Bubble Town — social layer schema, Phase 2: friends (codes, requests, list).
-- Run after schema.sql, in the Supabase SQL editor. Safe to re-run.
--
-- Design note: all friend operations go through SECURITY DEFINER functions that
-- return only what's needed (screenname + avatar). Profiles therefore stay
-- private — you can't read anyone's row directly, and there's no name/email
-- search. The only way to reach someone is by typing their exact friend code.

-- ── friend requests ──────────────────────────────────────────────────────────
create table if not exists public.friend_requests (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid not null references auth.users (id) on delete cascade,
  to_id      uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (from_id, to_id)
);
alter table public.friend_requests enable row level security;

drop policy if exists "fr select own" on public.friend_requests;
create policy "fr select own" on public.friend_requests
  for select using (auth.uid() = from_id or auth.uid() = to_id);

-- ── friendships (two rows per pair, one each direction → easy "my friends") ──
create table if not exists public.friendships (
  user_id    uuid not null references auth.users (id) on delete cascade,
  friend_id  uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
alter table public.friendships enable row level security;

drop policy if exists "fs select own" on public.friendships;
create policy "fs select own" on public.friendships
  for select using (auth.uid() = user_id);

-- ── operations (SECURITY DEFINER; profiles stay otherwise private) ───────────

-- Send a request by friend code. Returns: 'sent' | 'not_found' | 'self' |
-- 'already_friends' | 'incoming' (they already asked you).
create or replace function public.send_friend_request(code text)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  select id into target from profiles where friend_code = upper(trim(code));
  if target is null then return 'not_found'; end if;
  if target = auth.uid() then return 'self'; end if;
  if exists (select 1 from friendships where user_id = auth.uid() and friend_id = target) then return 'already_friends'; end if;
  if exists (select 1 from friend_requests where from_id = target and to_id = auth.uid() and status = 'pending') then return 'incoming'; end if;
  insert into friend_requests (from_id, to_id) values (auth.uid(), target)
    on conflict (from_id, to_id) do update set status = 'pending', created_at = now();
  return 'sent';
end; $$;
grant execute on function public.send_friend_request(text) to authenticated;

-- Accept a request you received → creates the friendship both ways.
create or replace function public.accept_friend_request(req_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.friend_requests;
begin
  select * into r from friend_requests where id = req_id and to_id = auth.uid() and status = 'pending';
  if not found then raise exception 'no such request'; end if;
  update friend_requests set status = 'accepted' where id = req_id;
  insert into friendships (user_id, friend_id) values (r.from_id, r.to_id), (r.to_id, r.from_id)
    on conflict do nothing;
end; $$;
grant execute on function public.accept_friend_request(uuid) to authenticated;

create or replace function public.decline_friend_request(req_id uuid)
returns void language sql security definer set search_path = public as $$
  update friend_requests set status = 'declined' where id = req_id and to_id = auth.uid() and status = 'pending';
$$;
grant execute on function public.decline_friend_request(uuid) to authenticated;

-- Listings (return only display-safe fields).
create or replace function public.list_friends()
returns table (id uuid, screenname text, avatar_url text, friend_code text)
language sql security definer set search_path = public as $$
  select p.id, p.screenname, p.avatar_url, p.friend_code
  from friendships f join profiles p on p.id = f.friend_id
  where f.user_id = auth.uid()
  order by p.screenname;
$$;
grant execute on function public.list_friends() to authenticated;

create or replace function public.incoming_requests()
returns table (req_id uuid, from_id uuid, screenname text, avatar_url text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select r.id, r.from_id, p.screenname, p.avatar_url, r.created_at
  from friend_requests r join profiles p on p.id = r.from_id
  where r.to_id = auth.uid() and r.status = 'pending'
  order by r.created_at desc;
$$;
grant execute on function public.incoming_requests() to authenticated;

-- ── Phase 3 groundwork: let friends read each other's saved world ────────────
drop policy if exists "worlds friends read" on public.worlds;
create policy "worlds friends read" on public.worlds
  for select using (
    auth.uid() = user_id
    or exists (select 1 from friendships f where f.user_id = auth.uid() and f.friend_id = worlds.user_id)
  );
