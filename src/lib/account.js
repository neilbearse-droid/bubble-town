// Account + cloud-save service layer for the social feature.
// Pure data/auth logic (no UI). The game works fully without any of this; it's
// only invoked once a player signs in.
import { supabase } from './supabase.js';
import { loginEmailFor, screennameKey } from './supabaseConfig.js';

// ── friend codes ────────────────────────────────────────────────────────────
// Human-friendly, unambiguous alphabet (no 0/O/1/I) so kids can read them aloud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function genFriendCode() {
  let s = '';
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `BBL-${s.slice(0, 3)}-${s.slice(3)}`;
}

// ── auth ────────────────────────────────────────────────────────────────────
// Sign up a new child account. Login identity is the screenname (mapped to a
// synthetic email); parentEmail is stored for reset/contact and may be reused
// across siblings.
export async function signUp({ screenname, parentEmail, password }) {
  screenname = (screenname || '').trim();
  if (screennameKey(screenname).length < 2) throw new Error('Pick a screenname with at least 2 letters or numbers.');
  if (!parentEmail || !/^\S+@\S+\.\S+$/.test(parentEmail)) throw new Error('Enter a valid parent email.');
  if (!password || password.length < 6) throw new Error('Password needs at least 6 characters.');

  const email = loginEmailFor(screenname);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) throw new Error('That screenname is taken — try another.');
    throw error;
  }
  const user = data.user;
  if (!user) throw new Error('Could not create the account. Is "Confirm email" turned off in Supabase?');

  // Insert the profile (retry once on the rare friend-code collision).
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error: pErr } = await supabase.from('profiles').insert({
      id: user.id, screenname, parent_email: parentEmail.trim(), friend_code: genFriendCode(),
    });
    if (!pErr) return user;
    if (/duplicate|unique/i.test(pErr.message) && /friend_code/i.test(pErr.message)) continue;
    if (/duplicate|unique/i.test(pErr.message)) throw new Error('That screenname is taken — try another.');
    throw pErr;
  }
  throw new Error('Could not finish creating the account. Please try again.');
}

export async function signIn({ screenname, password }) {
  const email = loginEmailFor((screenname || '').trim());
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Screenname or password is wrong.');
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

// Subscribe to auth changes; returns an unsubscribe fn.
export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user || null));
  return () => data.subscription.unsubscribe();
}

// ── profile ─────────────────────────────────────────────────────────────────
export async function getProfile() {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

// Upload a circular avatar PNG (Blob) and store its public URL on the profile.
export async function uploadAvatar(blob) {
  const user = await currentUser();
  if (!user) throw new Error('Not signed in.');
  const path = `${user.id}/avatar.png`;
  const { error: upErr } = await supabase.storage.from('avatars')
    .upload(path, blob, { upsert: true, contentType: 'image/png', cacheControl: '3600' });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust on change
  const { error: updErr } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
  if (updErr) throw updErr;
  return url;
}

// ── cloud save ──────────────────────────────────────────────────────────────
export async function saveWorld(state) {
  const user = await currentUser();
  if (!user) return;
  const { error } = await supabase.from('worlds')
    .upsert({ user_id: user.id, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function loadWorld() {
  const user = await currentUser();
  if (!user) return null;
  const { data, error } = await supabase.from('worlds').select('state, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return data || null;
}

// Read another player's world (read-only "visit"). RLS only allows this for friends.
export async function loadFriendWorld(userId) {
  const { data, error } = await supabase.from('worlds').select('state, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data || null;
}

// ── friends ─────────────────────────────────────────────────────────────────
// Send a request by friend code → 'sent' | 'not_found' | 'self' | 'already_friends' | 'incoming'.
export async function sendFriendRequest(code) {
  const { data, error } = await supabase.rpc('send_friend_request', { code });
  if (error) throw error;
  return data;
}
export async function listFriends() {
  const { data, error } = await supabase.rpc('list_friends');
  if (error) throw error;
  return data || [];
}
export async function incomingRequests() {
  const { data, error } = await supabase.rpc('incoming_requests');
  if (error) throw error;
  return data || [];
}
export async function acceptRequest(reqId) {
  const { error } = await supabase.rpc('accept_friend_request', { req_id: reqId });
  if (error) throw error;
}
export async function declineRequest(reqId) {
  const { error } = await supabase.rpc('decline_friend_request', { req_id: reqId });
  if (error) throw error;
}

// ── preset notes (DMs) ────────────────────────────────────────────────────────
export async function sendNote(toUser, presetId, sticker) {
  const { data, error } = await supabase.rpc('send_note', { to_user: toUser, p_preset: presetId, p_sticker: sticker || null });
  if (error) throw error;
  return data; // 'sent' | 'not_friends'
}
export async function inbox() {
  const { data, error } = await supabase.rpc('inbox');
  if (error) throw error;
  return data || [];
}
export async function unreadCount() {
  const { data, error } = await supabase.rpc('unread_count');
  if (error) throw error;
  return data || 0;
}
export async function markNotesRead() {
  const { error } = await supabase.rpc('mark_notes_read');
  if (error) throw error;
}
