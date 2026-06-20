// Single shared Supabase client for the whole app.
//
// The game stays 100% playable with no account — this module is only loaded/used
// once a player chooses to sign in, so solo/offline play is never affected.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabaseConfig.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,      // keep the session in localStorage between visits
    autoRefreshToken: true,
    detectSessionInUrl: false, // no OAuth redirects in this app
  },
});
