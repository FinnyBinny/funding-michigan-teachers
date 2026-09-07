import { createClient } from '@supabase/supabase-js';

/**
 * Supabase connection.
 *
 * These two values are baked in the same way the Stripe publishable key is in
 * donate.ts: the anon key is public by design (it ships in every browser
 * request and is safe as long as Row Level Security is configured — see
 * SUPABASE_REFRESH.sql, which locks all content writes behind an
 * authenticated admin login). A VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * build variable still overrides them if the project ever changes.
 *
 * Why baked in: Vite inlines import.meta.env.VITE_* at build time. The
 * production build on Cloudflare has no build-time env vars, so with only the
 * env read the client constant-folded to null and EVERY database feature
 * (votes, live content, the admin panel) silently vanished from the deployed
 * bundle. Never again.
 *
 * FILL THESE IN: Supabase dashboard → your project → Settings → API →
 * "Project URL" and the "anon public" key.
 */
const FALLBACK_URL = '';
const FALLBACK_ANON_KEY = '';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_ANON_KEY;

// null only when genuinely unconfigured — callers fall back to local seeds.
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
