-- Bubble Town — password reset (shared-parent-email friendly). Safe to re-run.
--
-- Flow: the parent proves they own their email via a 6-digit code (Supabase email
-- OTP), which signs them in as that email. These two functions then (1) list the
-- children registered under that email and (2) set a chosen child's password —
-- but ONLY for children whose parent_email matches the verified caller.
--
-- Needs pgcrypto (ships with Supabase, in the `extensions` schema).

-- Children registered under the signed-in parent's (verified) email.
create or replace function public.kids_for_parent()
returns table (id uuid, screenname text, avatar_url text)
language sql security definer set search_path = public as $$
  select id, screenname, avatar_url
  from public.profiles
  where lower(parent_email) = lower(auth.email())
  order by screenname;
$$;
grant execute on function public.kids_for_parent() to authenticated;

-- Reset a child's password. Returns 'ok' | 'too_short' | 'not_your_child'.
-- Only the verified parent (auth.email() == that child's parent_email) may do it.
create or replace function public.reset_kid_password(kid_id uuid, new_password text)
returns text language plpgsql security definer set search_path = public, extensions as $$
begin
  if char_length(new_password) < 6 then return 'too_short'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = kid_id and lower(p.parent_email) = lower(auth.email())
  ) then
    return 'not_your_child';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = kid_id;
  return 'ok';
end; $$;
grant execute on function public.reset_kid_password(uuid, text) to authenticated;
