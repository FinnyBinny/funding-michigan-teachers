import { loadStripe } from '@stripe/stripe-js/pure';
import type { Stripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './donate';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Stripe.js, loaded the first time a checkout opens.
 *
 * The default '@stripe/stripe-js' import injects Stripe's script the moment
 * the module loads, so every view of /donate or /shop fetched it (and let it
 * set its cookies) before anyone had decided to pay. The '/pure' entry waits
 * until loadStripe() is called, which happens here, when a checkout dialog
 * mounts. null when no key is configured.
 */
export function getStripe(): Promise<Stripe | null> | null {
  if (!STRIPE_PUBLISHABLE_KEY) return null;
  stripePromise ??= loadStripe(STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
}
