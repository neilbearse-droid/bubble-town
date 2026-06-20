// Supabase connection details for the social layer.
//
// These two values are PUBLIC by design: the publishable key is meant to live in
// the client bundle, and access is protected by Postgres Row-Level Security — not
// by keeping the key secret. (Never put the *secret* / service-role key here.)
//
// Env vars win if provided (so CI or a fork can point at a different project);
// otherwise we fall back to the committed public values so the build works
// out-of-the-box.
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://pqqsqiyzeqhhfbeczzsl.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jzYuo2v1Ojx6sM_lpNQ5hQ_zCoM8-bQ';

// Synthetic auth-email domain. Kids log in with a screenname; under the hood each
// account gets a unique address at this domain so that a real PARENT email can be
// shared across siblings (Supabase Auth requires unique emails per user).
export const LOGIN_EMAIL_DOMAIN = 'players.bubbletown.app';

// Normalise a screenname into the stable key used for the synthetic login email
// and for uniqueness. MUST match the SQL `screenname_key` definition.
export const screennameKey = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const loginEmailFor = (screenname) => `${screennameKey(screenname)}@${LOGIN_EMAIL_DOMAIN}`;
