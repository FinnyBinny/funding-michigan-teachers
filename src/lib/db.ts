/**
 * The Supabase client, loaded on demand.
 *
 * The homepage only reads from the database to refresh content it already
 * has a built-in copy of (initialData.ts), so supabase-js (about 45 KB
 * compressed, 175 KB to parse) has no business holding up its first paint.
 * Homepage code awaits this instead of importing lib/supabase directly,
 * which puts the library in its own chunk fetched after the page shows.
 * Pages that need the database at once (/access, /box, forms pages) still
 * import lib/supabase as before.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

let client: Promise<SupabaseClient | null> | null = null;

export function loadSupabase(): Promise<SupabaseClient | null> {
  client ??= import('./supabase').then((m) => m.supabase).catch(() => {
    client = null; // let a later call retry (offline, a deploy swapped chunks)
    return null;
  });
  return client;
}
