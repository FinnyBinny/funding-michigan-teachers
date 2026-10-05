/**
 * The Supabase project URL and publishable key, shared by the browser client
 * (src/lib/supabase.ts) and the Worker.
 *
 * Both are public by design: the publishable key ships in every browser
 * request, and Row Level Security — not secrecy — is what protects the data
 * (see SUPABASE_REFRESH.sql: reads are open, every content write needs a
 * signed-in admin). The secret / service_role key must never appear here.
 *
 * The Worker uses these only to READ: it looks a classroom project up by id
 * before naming it on a donor's receipt, so a forged id cannot put a made-up
 * project on a payment.
 */
export const SUPABASE_URL = 'https://zvzlgawpezovdwmnvwlg.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_N3fEhiPqKwmodLPXxyI9iQ_y-UiCVtI';
