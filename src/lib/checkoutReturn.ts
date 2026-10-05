/**
 * Coming back from Stripe Checkout.
 *
 * Stripe returns donors and buyers to /donate?stripe_session_id=cs_… (or
 * /shop?…). Left in the address bar, that ID went to Google Analytics as part
 * of the page URL and to Bloomerang's visit tracker, and anyone holding it can
 * ask the Worker for that payment's status and amount. It also meant every
 * reload of the thank-you page counted the conversion again, which would
 * inflate the numbers Google Ads optimises on.
 *
 * So: main.tsx calls stripCheckoutReturn() before analytics starts, which
 * removes the parameter from the URL and keeps it in memory for the page;
 * the page reads it with takeCheckoutSessionId(); and countConversionOnce()
 * reports each payment once per browser.
 */

let pendingSessionId: string | null = null;

/** Run once, at startup, before analytics reads the URL. */
export function stripCheckoutReturn(): void {
  try {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('stripe_session_id');
    if (!id) return;
    pendingSessionId = id;
    url.searchParams.delete('stripe_session_id');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  } catch {
    /* an unparseable URL has nothing to strip */
  }
}

/** The Stripe session this page load returned from, if any. Read it once. */
export function takeCheckoutSessionId(): string | null {
  const id = pendingSessionId;
  pendingSessionId = null;
  return id;
}

/**
 * True the first time a given payment is seen in this browser, false after.
 * When storage is blocked it returns true: one extra count is better than
 * never counting a real gift.
 */
export function countConversionOnce(sessionId: string): boolean {
  const key = `fmt:counted:${sessionId}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
  } catch {
    /* storage blocked */
  }
  return true;
}
