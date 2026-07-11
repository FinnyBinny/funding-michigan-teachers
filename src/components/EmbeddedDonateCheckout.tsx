import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X, AlertCircle, Shield } from 'lucide-react';
import type { DonationFrequency } from '../lib/donate';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

interface EmbeddedDonateCheckoutProps {
  amount: number;
  frequency: DonationFrequency;
  onClose: () => void;
}

/**
 * Renders Stripe's Embedded Checkout directly on the page — no redirect to
 * buy.stripe.com. The card form, Apple Pay, and Google Pay all render
 * inside this panel. Handles both one-time and subscription (monthly)
 * donations via the same component.
 */
export default function EmbeddedDonateCheckout({ amount, frequency, onClose }: EmbeddedDonateCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  // loadStripe() can reject if js.stripe.com is unreachable (network blip,
  // ad-blocker, restrictive proxy) — without this, a rejected promise leaves
  // <EmbeddedCheckoutProvider> stuck blank with no feedback for the donor.
  useEffect(() => {
    if (!stripePromise) return;
    stripePromise.catch(() => {
      setError("Couldn't load the secure checkout script. Check your connection or try disabling any ad/script blockers.");
    });
  }, []);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, frequency }),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      setError(data.error || 'Could not start checkout. Please try again.');
      throw new Error(data.error || 'checkout session creation failed');
    }
    return data.clientSecret as string;
  }, [amount, frequency]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-chalkboard px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-white font-bold text-sm">
              Donating ${amount}{frequency === 'monthly' ? '/month' : ''}
            </p>
            <p className="text-white/45 text-[10px] uppercase tracking-[0.18em] font-bold mt-0.5 flex items-center gap-1.5">
              <Shield size={10} strokeWidth={1.5} />
              Secure checkout by Stripe
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-paper/40">
          {!PUBLISHABLE_KEY ? (
            <div className="p-10 flex flex-col items-center text-center gap-3">
              <AlertCircle size={28} className="text-pencil-dark" />
              <p className="font-bold text-chalkboard">Stripe isn't configured yet.</p>
              <p className="text-sm text-chalkboard/55 max-w-xs">
                An admin needs to set <code className="bg-chalkboard/5 px-1.5 py-0.5 rounded text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> and{' '}
                <code className="bg-chalkboard/5 px-1.5 py-0.5 rounded text-xs">STRIPE_SECRET_KEY</code> in Vercel before embedded checkout will work.
              </p>
            </div>
          ) : error ? (
            <div className="p-10 flex flex-col items-center text-center gap-3">
              <AlertCircle size={28} className="text-apple" />
              <p className="font-bold text-chalkboard">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm font-bold text-apple hover:text-apple/80 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          ) : (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
