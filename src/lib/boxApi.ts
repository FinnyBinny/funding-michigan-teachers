import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../../shared/supabasePublic';

/**
 * Calls one of the box database functions (SUPABASE_BOXES.sql) directly.
 *
 * The box page used the full Supabase client for this. Two problems on a
 * phone standing at a box: the client is a 46 KB download the page needs for
 * nothing else, and before every call it first waits on its own sign-in
 * bookkeeping (restoring or refreshing a saved login, behind a browser
 * lock), which can stall for minutes and has no timeout. These functions
 * need no login, so this is a plain request with the public key and a hard
 * time limit: the page either answers within seconds or says it could not
 * reach us and offers a retry.
 */
export async function boxRpc<T>(
  fn: 'box_lookup' | 'box_claim' | 'box_request_pickup' | 'box_scan',
  args: Record<string, string>,
  timeoutMs = 10000,
): Promise<{ data: T | null; error: boolean }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      signal: ctrl.signal,
    });
    if (!res.ok) return { data: null, error: true };
    const text = await res.text();
    return { data: text ? (JSON.parse(text) as T | null) : null, error: false };
  } catch {
    return { data: null, error: true };
  } finally {
    clearTimeout(timer);
  }
}
