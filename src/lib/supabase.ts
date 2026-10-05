import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../../shared/supabasePublic';

/**
 * Supabase connection.
 *
 * These two values are baked in the same way the Stripe publishable key is in
 * donate.ts. The publishable key (formerly called the "anon" key) is public by
 * design: it ships in every browser request, and what protects the data is Row
 * Level Security, not secrecy — see SUPABASE_REFRESH.sql, where every content
 * write requires a signed-in admin and only reads are open. The `secret` /
 * `service_role` key is the one that must never appear here.
 *
 * Why baked in rather than read from the environment: Vite inlines
 * import.meta.env.VITE_* at BUILD time, and the Cloudflare build has no
 * build-time variables. With only the env read, these constants resolved to
 * undefined, `supabase` folded to null, and the bundler deleted every database
 * call as unreachable — so votes, live content, and the admin panel silently
 * vanished from the deployed site while still appearing to work locally. The
 * VITE_* overrides below still apply if they are ever set at build time.
 */
// Shared with the Worker, which reads project names from the same project.
const FALLBACK_URL = SUPABASE_URL;
const FALLBACK_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

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
let memoryVoterId: string | null = null;

/**
 * This browser's voter ID if it has one, without creating it. Loading the
 * homepage used to create and store an ID for every visitor before anyone
 * voted; now one exists only after a vote.
 */
export function peekVoterId(): string | null {
  try {
    return localStorage.getItem('fmt_voter_id') ?? memoryVoterId;
  } catch {
    return memoryVoterId;
  }
}

export function getVoterId(): string {
  // localStorage throws when a browser blocks site storage; the vote still
  // counts, it just is not remembered after this visit.
  try {
    let id = localStorage.getItem('fmt_voter_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('fmt_voter_id', id);
    }
    return id;
  } catch {
    memoryVoterId ??= crypto.randomUUID();
    return memoryVoterId;
  }
}
