/**
 * Donation routing — three tiers, each a graceful fallback of the last, so
 * the site never stops accepting donations no matter what's configured.
 *
 *   1. Embedded Stripe Checkout (preferred) — the card form renders directly
 *      on /donate via <EmbeddedDonateCheckout>. No redirect at all. Handles
 *      one-time AND monthly subscriptions through the same component.
 *   2. Stripe Payment Links — opens buy.stripe.com in a new tab. Used only
 *      if embedded isn't configured.
 *   3. Zeffy — used if neither Stripe path is configured.
 *
 * ── Setting up embedded Stripe (recommended) ────────────────────────────
 *   1. The publishable key (pk_...) is baked in below — publishable keys
 *      are public by design, so this needs no configuration at all.
 *   2. The only required setup: Cloudflare dashboard → Workers & Pages →
 *      funding-michigan-teachers → Settings → Variables and Secrets → add
 *      STRIPE_SECRET_KEY as a **Secret** (server only — NEVER prefix it
 *      with VITE_, that would ship it to every browser).
 *   3. Redeploy. That's it — no Payment Links to create, no dashboard
 *      product setup. The amount is set dynamically from the page (tiles,
 *      slider, or custom input) and sent to /api/create-checkout-session,
 *      handled by the Cloudflare Worker (worker/index.ts) that serves
 *      this site.
 *
 * ── Setting up Payment Links (fallback path) ────────────────────────────
 *   1. Stripe Dashboard → Payment Links → "Create payment link"
 *   2. Choose "Customers choose what to pay"
 *   3. Create two links: one for "One-time", one for "Subscription / Recurring"
 *   4. Cloudflare → Settings → Build → Variables and secrets (build-time,
 *      because Vite inlines VITE_* values during `npm run build`):
 *        VITE_STRIPE_LINK_ONCE     = https://buy.stripe.com/...
 *        VITE_STRIPE_LINK_MONTHLY  = https://buy.stripe.com/...
 */

// Publishable keys only identify the Stripe account — all charging happens
// server-side with the secret key — so committing this one is safe and
// means checkout works with zero build-time env configuration. A
// VITE_STRIPE_PUBLISHABLE_KEY build variable still overrides it if the key
// ever changes.
export const STRIPE_PUBLISHABLE_KEY: string =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ||
  'pk_live_51SBEMjRmDenxI6morWfSo1qpoDd3NsB1Avw6ZL091BIoEN0u25195bWjT5eSlBWCwPuuNNPSZIikSOQdcYOgXxh300igZ280Pk';
const STRIPE_ONCE    = import.meta.env.VITE_STRIPE_LINK_ONCE as string | undefined;
const STRIPE_MONTHLY = import.meta.env.VITE_STRIPE_LINK_MONTHLY as string | undefined;

const ZEFFY_FALLBACK = 'https://www.zeffy.com/en-US/donation-form/supporting-the-teachers-who-support-us';

export type DonationFrequency = 'monthly' | 'once';

export interface DonationParams {
  amount?: number;          // USD, integer dollars. Undefined → customer chooses on Stripe
  frequency?: DonationFrequency;
}

/**
 * True if embedded Stripe Checkout can be used. This only confirms the
 * client-safe publishable key is present; the server-side secret key is
 * validated when /api/create-checkout-session is actually called (its
 * error surfaces in the checkout panel if missing).
 */
export function isEmbeddedStripeConfigured(): boolean {
  return !!STRIPE_PUBLISHABLE_KEY;
}

/** Returns true if a Stripe Payment Link is configured for the given frequency. */
export function isStripeConfigured(frequency: DonationFrequency = 'once'): boolean {
  return frequency === 'monthly' ? !!STRIPE_MONTHLY : !!STRIPE_ONCE;
}

/** Returns true if any Stripe path (embedded or Payment Links) is set up. */
export function isAnyStripeConfigured(): boolean {
  return isEmbeddedStripeConfigured() || !!(STRIPE_ONCE || STRIPE_MONTHLY);
}

/**
 * Build the Payment Link checkout URL (tier 2 fallback). Stripe Payment
 * Links support `prefilled_amount` (in cents) on links configured to let
 * the customer choose what to pay.
 */
export function getDonationUrl({ amount, frequency = 'once' }: DonationParams = {}): string {
  const stripeLink = frequency === 'monthly' ? STRIPE_MONTHLY : STRIPE_ONCE;
  if (stripeLink) {
    if (amount && amount > 0) {
      const cents = Math.round(amount * 100);
      const sep = stripeLink.includes('?') ? '&' : '?';
      return `${stripeLink}${sep}prefilled_amount=${cents}`;
    }
    return stripeLink;
  }
  // Fallback to Zeffy until Stripe is configured.
  if (amount && amount > 0) {
    return `${ZEFFY_FALLBACK}?amount=${amount}&frequency=${frequency}`;
  }
  return ZEFFY_FALLBACK;
}

/**
 * Opens tier-2/3 checkout (Payment Link or Zeffy) in a new tab. Only used
 * as a fallback when embedded Stripe isn't configured — see
 * <EmbeddedDonateCheckout> for the primary, on-page flow.
 */
export function openDonation(params: DonationParams = {}): void {
  const url = getDonationUrl(params);
  window.open(url, '_blank', 'noopener,noreferrer');
}
