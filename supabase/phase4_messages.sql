-- Bubble Town — social layer, Phase 4: preset-note DMs.
-- Run after phase2_friends.sql, in the Supabase SQL editor. Safe to re-run.
--
-- Notes carry only a PRESET INDEX + an optional emoji sticker — never free text —
-- so there is nothing to moderate. You can only send to someone you're friends
-- with (enforced in send_note).

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid not null references auth.users (id) on delete cascade,
  to_id      uuid not null references auth.users (id) on delete cascade,
  preset_id  int  not null,
  sticker    text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_to_idx on public.messages (to_id, created_at desc);
alter table public.messages enable row level security;

-- You can read messages addressed to you. (Sends go through send_note below.)
drop policy if exists "msg select to me" on public.messages;
create policy "msg select to me" on public.messages
  for select using (auth.uid() = to_id);

-- Send a preset note to a friend. Returns 'sent' | 'not_friends'.
create or replace function public.send_note(to_user uuid, p_preset int, p_sticker text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from friendships where user_id = auth.uid() and friend_id = to_user) then
    return 'not_friends';
  end if;
  insert into messages (from_id, to_id, preset_id, sticker)
  values (auth.uid(), to_user, p_preset, nullif(p_sticker, ''));
  return 'sent';
end; $$;
grant execute on function public.send_note(uuid, int, text) to authenticated;

-- Your inbox, newest first, with sender display info.
create or replace function public.inbox()
returns table (id uuid, from_id uuid, screenname text, avatar_url text, preset_id int, sticker text, read boolean, created_at timestamptz)
language sql security definer set search_path = public as $$
  select m.id, m.from_id, p.screenname, p.avatar_url, m.preset_id, m.sticker, m.read, m.created_at
  from messages m join profiles p on p.id = m.from_id
  where m.to_id = auth.uid()
  order by m.created_at desc
  limit 100;
$$;
grant execute on function public.inbox() to authenticated;

create or replace function public.unread_count()
returns int language sql security definer set search_path = public as $$
  select count(*)::int from messages where to_id = auth.uid() and not read;
$$;
grant execute on function public.unread_count() to authenticated;

create or replace function public.mark_notes_read()
returns void language sql security definer set search_path = public as $$
  update messages set read = true where to_id = auth.uid() and not read;
$$;
grant execute on function public.mark_notes_read() to authenticated;
