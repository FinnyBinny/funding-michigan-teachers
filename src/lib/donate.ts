/**
 * Donation routing — Stripe Payment Links as the primary path.
 *
 * Setup (one-time, by FMT admin):
 *   1. Log in to https://dashboard.stripe.com
 *   2. Sidebar → Payment Links → "Create payment link"
 *   3. Choose "Customers choose what to pay"
 *   4. Create two links: one for "One-time" and one for "Subscription / Recurring"
 *   5. Copy each https://buy.stripe.com/... URL
 *   6. In Vercel project → Settings → Environment Variables, add:
 *        VITE_STRIPE_LINK_ONCE     = https://buy.stripe.com/...      (one-time)
 *        VITE_STRIPE_LINK_MONTHLY  = https://buy.stripe.com/...      (recurring)
 *   7. Redeploy.
 *
 * Apple Pay and Google Pay show automatically on Stripe Checkout when the
 * user's device supports them, so the 3-click flow is:
 *   1. Pick an amount tile (or hit "Donate" with custom amount)
 *   2. Stripe Checkout opens — tap "Pay with Apple Pay"
 *   3. Face ID / Touch ID confirms.    Done.
 *
 * Until the env vars are set, this falls back to the existing Zeffy URL so
 * the site never stops accepting donations.
 */

const STRIPE_ONCE    = import.meta.env.VITE_STRIPE_LINK_ONCE as string | undefined;
const STRIPE_MONTHLY = import.meta.env.VITE_STRIPE_LINK_MONTHLY as string | undefined;

const ZEFFY_FALLBACK = 'https://www.zeffy.com/en-US/donation-form/supporting-the-teachers-who-support-us';

export type DonationFrequency = 'monthly' | 'once';

export interface DonationParams {
  amount?: number;          // USD, integer dollars. Undefined → customer chooses on Stripe
  frequency?: DonationFrequency;
}

/** Returns true if a Stripe Payment Link is configured for the given frequency. */
export function isStripeConfigured(frequency: DonationFrequency = 'once'): boolean {
  return frequency === 'monthly' ? !!STRIPE_MONTHLY : !!STRIPE_ONCE;
}

/** Returns true if either Stripe link is set up. */
export function isAnyStripeConfigured(): boolean {
  return !!(STRIPE_ONCE || STRIPE_MONTHLY);
}

/**
 * Build the checkout URL. Stripe Payment Links support `prefilled_amount`
 * (in cents) on links configured to let the customer choose what to pay.
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
 * Opens checkout. Targets a new tab so the user doesn't lose context if they
 * abandon. (Stripe blocks iframe embedding for security; popup is the
 * cleanest option.)
 */
export function openDonation(params: DonationParams = {}): void {
  const url = getDonationUrl(params);
  window.open(url, '_blank', 'noopener,noreferrer');
}
