import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// supabase will be null if env vars are not configured — vote logic falls back to localStorage
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/** Returns a stable anonymous voter ID for this browser (stored in localStorage). */
export function getVoterId(): string {
  let id = localStorage.getItem('fmt_voter_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('fmt_voter_id', id);
  }
  return id;
}
