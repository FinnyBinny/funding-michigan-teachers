import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Heart, Shield, Sparkles, Apple as AppleIcon,
  CreditCard, ChevronRight, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { isAnyStripeConfigured, isEmbeddedStripeConfigured, openDonation, type DonationFrequency } from '../lib/donate';
import ImpactVisualizer from '../components/ImpactVisualizer';
import EmbeddedDonateCheckout from '../components/EmbeddedDonateCheckout';
import SiteFooter from '../components/SiteFooter';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const TILES = [
  { amount: 25,  label: 'Supply Starter',   impact: 'Helps stock a classroom supply box' },
  { amount: 50,  label: 'Meeting Booster',  impact: "Adds to a school's staff-meeting food fund" },
  { amount: 75,  label: 'Recognition Crew', impact: 'Supports Teacher of the Month gifts' },
  { amount: 100, label: 'Classroom Backer', impact: 'Builds toward a full classroom grant' },
  { amount: 250, label: 'Grant Maker',      impact: 'Funds one full $250 classroom grant' },
];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

type SuccessState = 'checking' | 'confirmed' | 'failed' | null;

export default function DonatePage() {
  // Single source of truth for the gift amount — tiles, slider, and the
  // custom input all write here so the impact visualizer stays live.
  const [amount, setAmount] = useState(25);
  const [frequency, setFrequency] = useState<DonationFrequency>('monthly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [success, setSuccess] = useState<SuccessState>(null);

  const embeddedReady = isEmbeddedStripeConfigured();
  const stripeReady = isAnyStripeConfigured();

  // Deep-link support: /donate?amount=50 preselects the amount. Also checks
  // for a return from embedded Stripe Checkout (?stripe_session_id=...) to
  // show a confirmed/failed state instead of the picker.
  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(window.location.search);

    const sessionId = params.get('stripe_session_id');
    if (sessionId) {
      setSuccess('checking');
      fetch(`/api/checkout-session-status?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          const ok = data.status === 'complete' || data.paymentStatus === 'paid' || data.paymentStatus === 'no_payment_required';
          setSuccess(ok ? 'confirmed' : 'failed');
        })
        .catch(() => setSuccess('failed'));
      return;
    }

    const a = params.get('amount');
    const n = a ? parseInt(a, 10) : NaN;
    if (!isNaN(n) && n > 0) setAmount(n);
  }, []);

  const canDonate = amount > 0;

  const handleDonateClick = () => {
    if (!canDonate) return;
    if (embeddedReady) {
      setShowCheckout(true);
    } else {
      openDonation({ amount, frequency });
    }
  };

  // ── Post-checkout confirmation state ──────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[100dvh] bg-paper flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-md w-full text-center"
        >
          {success === 'checking' && (
            <>
              <Loader2 className="animate-spin text-apple mx-auto mb-5" size={32} />
              <p className="text-chalkboard/60">Confirming your donation…</p>
            </>
          )}
          {success === 'confirmed' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-apple/10 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-apple" />
              </div>
              <h1 className="font-serif font-bold text-3xl mb-3">Thank you.</h1>
              <p className="text-chalkboard/60 leading-relaxed mb-8">
                Your gift is on its way to a Michigan classroom. A receipt is on its way to your inbox — 100% tax-deductible, EIN 93-4485967.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-chalkboard text-white pl-6 pr-2 py-2 rounded-full font-bold text-sm uppercase tracking-[0.18em]"
              >
                Back to Home
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight size={13} />
                </span>
              </button>
            </>
          )}
          {success === 'failed' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pencil/15 flex items-center justify-center">
                <AlertCircle size={30} className="text-pencil-dark" />
              </div>
              <h1 className="font-serif font-bold text-3xl mb-3">Couldn't confirm that.</h1>
              <p className="text-chalkboard/60 leading-relaxed mb-8">
                We weren't able to verify this donation. If you were charged, it will still show up in your Stripe receipt — otherwise, feel free to try again.
              </p>
              <button
                onClick={() => { setSuccess(null); navigate('/donate'); }}
                className="inline-flex items-center gap-2 bg-apple text-white pl-6 pr-2 py-2 rounded-full font-bold text-sm uppercase tracking-[0.18em]"
              >
                Try Again
                <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowRight size={13} />
                </span>
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative">

      {/* Floating glass nav island */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/85 backdrop-blur-2xl ring-1 ring-chalkboard/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-1 pl-2 pr-2 py-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-chalkboard/5"
            style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
          >
            <span className="w-7 h-7 rounded-full bg-chalkboard/5 flex items-center justify-center group-hover:bg-chalkboard/10">
              <ArrowLeft size={13} strokeWidth={1.5} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hidden sm:inline">Home</span>
          </button>
          <div className="w-px h-6 bg-chalkboard/10 mx-1" />
          <div className="hidden md:flex items-center gap-0.5">
            <button onClick={() => navigate('/sponsors')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5">Sponsor</button>
            <button onClick={() => navigate('/for-schools')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5">For Schools</button>
          </div>
        </div>
      </nav>

      {/* Ambient brand glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/[0.06] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pencil/[0.08] rounded-full blur-[160px]" />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">

          {/* HEADER — editorial split */}
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-white/85 ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-7 uppercase tracking-[0.24em] text-chalkboard/70 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <span className="w-1.5 h-1.5 rounded-full bg-apple animate-pulse" />
                Apple Pay · Google Pay · Card · 3 clicks
              </div>
              <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.025em] mb-7 text-[clamp(2.5rem,5vw,4.5rem)]">
                Make this <span className="text-apple italic font-normal">real</span> for a Michigan teacher.
              </h1>
              <p className="text-lg text-chalkboard/65 max-w-xl leading-relaxed font-light mb-5">
                Drag the slider and watch your gift turn into pencils, staff meals, and classroom grants — then tap once with Apple Pay or Google Pay. 100% goes to teachers.
              </p>
              <div className="inline-flex items-center gap-2 bg-chalkboard/5 text-chalkboard/60 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-pencil-dark" />
                2026–27 School Year Goal: $20,000
              </div>
            </motion.div>

            {/* Trust signals card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="lg:col-span-5"
            >
              <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                <div className="bg-white rounded-[calc(2rem-0.5rem)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-5">Why donate here</p>
                  <ul className="space-y-3.5">
                    {[
                      { i: Shield, t: '501(c)(3) tax-deductible', s: 'EIN 93-4485967 — receipt emailed instantly' },
                      { i: Sparkles, t: 'Direct to teachers', s: 'Funds classrooms, meals, and appreciation events' },
                      { i: CreditCard, t: 'Bank-level security', s: 'Processed by Stripe with full PCI compliance' },
                    ].map((row) => (
                      <li key={row.t} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-apple/10 text-apple flex items-center justify-center shrink-0 mt-0.5">
                          <row.i size={14} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-chalkboard">{row.t}</p>
                          <p className="text-xs text-chalkboard/55 mt-0.5 font-light leading-snug">{row.s}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Frequency toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            className="flex justify-center mb-10"
          >
            <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/10 rounded-full p-1 flex items-center gap-1">
              {(['monthly', 'once'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ transition: 'color 500ms cubic-bezier(0.32,0.72,0,1)' }}
                >
                  {frequency === f && (
                    <motion.span
                      layoutId="freq-pill"
                      className="absolute inset-0 bg-chalkboard rounded-full"
                      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    />
                  )}
                  <span className={cn('relative z-10', frequency === f ? 'text-white' : 'text-chalkboard/60')}>
                    {f === 'monthly' ? 'Monthly' : 'One-time'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* THE IMPACT VISUALIZER — the centerpiece */}
          <div className="mb-12">
            <ImpactVisualizer amount={amount} onAmountChange={setAmount} frequency={frequency} />
          </div>

          {/* QUICK TILES — one tap sets the visualizer + amount */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-10">
            {TILES.map((tile, i) => {
              const selected = amount === tile.amount;
              return (
                <motion.button
                  key={tile.label}
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.35 + i * 0.05, ease: EASE }}
                  onClick={() => setAmount(tile.amount)}
                  className="group text-left"
                  style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
                >
                  <div
                    className={cn(
                      'h-full rounded-[1.75rem] p-1.5 ring-1',
                      selected ? 'bg-apple/10 ring-apple/40' : 'bg-chalkboard/[0.03] ring-chalkboard/8 group-hover:ring-chalkboard/20',
                    )}
                    style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
                  >
                    <div className="h-full rounded-[calc(1.75rem-0.375rem)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] flex flex-col bg-white">
                      <p className="font-serif font-bold text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none tracking-[-0.02em] text-chalkboard mb-2">
                        ${tile.amount}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-chalkboard/50 mb-2">{tile.label}</p>
                      <p className="text-[11px] text-chalkboard/55 leading-snug font-light mt-auto">{tile.impact}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* PRIMARY CTA — opens embedded Stripe checkout inline (or falls back) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            className="flex justify-center mb-6"
          >
            <button
              onClick={handleDonateClick}
              disabled={!canDonate}
              className={cn(
                'group flex items-center gap-3 pl-9 pr-2 py-2.5 rounded-full font-bold text-base shadow-[0_18px_40px_rgba(192,57,43,0.35)] active:scale-[0.98]',
                canDonate ? 'bg-apple text-white' : 'bg-chalkboard/20 text-chalkboard/40 pointer-events-none',
              )}
              style={{ transition: 'all 700ms cubic-bezier(0.32,0.72,0,1)' }}
            >
              <Heart size={18} strokeWidth={1.5} className="fill-current" />
              <span className="uppercase tracking-[0.18em] text-sm">
                Donate ${amount}{frequency === 'monthly' ? '/mo' : ''}
              </span>
              <span className="w-11 h-11 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-all">
                <ArrowRight size={16} strokeWidth={1.5} />
              </span>
            </button>
          </motion.div>

          {/* Payment method indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-12 text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/35"
          >
            <span className="flex items-center gap-1.5">
              <AppleIcon size={11} strokeWidth={1.5} />
              Apple Pay
            </span>
            <span className="w-1 h-1 rounded-full bg-chalkboard/15" />
            <span>Google Pay</span>
            <span className="w-1 h-1 rounded-full bg-chalkboard/15" />
            <span>Card</span>
            <span className="w-1 h-1 rounded-full bg-chalkboard/15" />
            <span>Bank</span>
          </motion.div>

          {/* Setup-required notice (admin only, until env vars are configured) */}
          {!stripeReady && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="bg-pencil/10 ring-1 ring-pencil/30 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle size={18} strokeWidth={1.5} className="text-pencil-dark shrink-0 mt-0.5" />
                <div className="text-xs text-chalkboard/70 leading-relaxed">
                  <p className="font-bold text-chalkboard mb-1">Admin: Stripe isn't configured yet.</p>
                  <p>
                    For embedded checkout (recommended — no redirect), add{' '}
                    <code className="bg-white/60 px-1.5 py-0.5 rounded text-[11px] font-mono">STRIPE_SECRET_KEY</code> as a Secret in the Cloudflare
                    dashboard (Workers &amp; Pages → Settings → Variables and Secrets).
                    Until then, donations fall back to Zeffy. See <code className="bg-white/60 px-1.5 py-0.5 rounded text-[11px] font-mono">src/lib/donate.ts</code> for full setup steps.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Closing call */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-16 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-chalkboard/30 mb-4">Not ready to give today?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/sponsors')}
                className="group flex items-center gap-2 bg-white ring-1 ring-chalkboard/15 hover:ring-chalkboard/30 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-chalkboard/70 hover:text-chalkboard"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Become a Corporate Sponsor
                <span className="w-7 h-7 rounded-full bg-chalkboard/5 group-hover:bg-chalkboard group-hover:text-white flex items-center justify-center group-hover:translate-x-0.5">
                  <ChevronRight size={11} strokeWidth={1.5} />
                </span>
              </button>
              <button
                onClick={() => navigate('/for-schools')}
                className="group flex items-center gap-2 bg-white ring-1 ring-chalkboard/15 hover:ring-chalkboard/30 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-chalkboard/70 hover:text-chalkboard"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Bring FMT to Your School
                <span className="w-7 h-7 rounded-full bg-chalkboard/5 group-hover:bg-chalkboard group-hover:text-white flex items-center justify-center group-hover:translate-x-0.5">
                  <ChevronRight size={11} strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <SiteFooter />

      <div className="grain-overlay" aria-hidden="true" />

      {/* Embedded checkout panel — the card form lives on this page, no redirect */}
      <AnimatePresence>
        {showCheckout && (
          <EmbeddedDonateCheckout
            amount={amount}
            frequency={frequency}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
