import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  School,
  ArrowLeft, ArrowRight, Heart, Shield, Sparkles, Apple as AppleIcon,
  CreditCard, ChevronRight, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { isAnyStripeConfigured, isEmbeddedStripeConfigured, openDonation, type DonationFrequency } from '../lib/donate';
import ImpactVisualizer from '../components/ImpactVisualizer';
import SupplyBasket from '../components/SupplyBasket';
import EmbeddedDonateCheckout from '../components/EmbeddedDonateCheckout';
import SiteHeader from '../components/SiteHeader';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { track } from '../lib/analytics';
import { takeCheckoutSessionId, countConversionOnce } from '../lib/checkoutReturn';
import { subscribeToImpactReport } from '../lib/newsletter';
import SiteFooter from '../components/SiteFooter';
import { useProjects } from '../hooks/useLocalData';
import {
  MIN_GIFT, MAX_GIFT,
  coverFee as grossUp, decodeDesignation, designationFromLegacyFund, dollars,
  encodeDesignation, schoolFundLabel, schoolFunds,
} from '../../shared/donations';

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
  // One-time by default. Defaulting to monthly brought fewer donors overall in
  // donor-form tests (NextAfter), and from a project, a school refill or a
  // yearly sponsorship it turned one click into an open-ended subscription:
  // "$250 a year" opened as $250 a month. A link can ask for monthly
  // (?frequency=monthly), as the homepage's monthly tiers do.
  const [frequency, setFrequency] = useState<DonationFrequency>('once');
  // What is typed in "Other amount", kept as text so "12." can be typed.
  const [otherText, setOtherText] = useState('');
  const [otherError, setOtherError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  // Where the gift goes: 'general', 'school:<slug>' or 'project:<id>'. The
  // Worker checks every one of these against something it trusts before it
  // names the fund on a receipt — see shared/donations.ts.
  const [designation, setDesignation] = useState('general');
  // Pre-ticked at the founder's choice; the donor sees the exact amount and
  // can untick it. Display only — the Worker computes the fee itself.
  const [coverFee, setCoverFee] = useState(true);
  const projects = useProjects().filter((p) => p.teacher_name !== 'Submit a Project');
  const [success, setSuccess] = useState<SuccessState>(null);
  const [thanks, setThanks] = useState<{ giftCents: number | null; label: string | null; monthly: boolean } | null>(null);

  const embeddedReady = isEmbeddedStripeConfigured();
  const stripeReady = isAnyStripeConfigured();

  // Deep-link support: /donate?amount=50 preselects the amount. Also checks
  // for a return from embedded Stripe Checkout (?stripe_session_id=...) to
  // show a confirmed/failed state instead of the picker.
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/donate'));
    const params = new URLSearchParams(window.location.search);

    const sessionId = takeCheckoutSessionId();
    if (sessionId) {
      setSuccess('checking');
      fetch(`/api/checkout-session-status?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data: { status?: string; paymentStatus?: string; amountTotal?: number; mode?: string; giftCents?: number | null; designationLabel?: string | null }) => {
          const ok = data.status === 'complete' || data.paymentStatus === 'paid' || data.paymentStatus === 'no_payment_required';
          setSuccess(ok ? 'confirmed' : 'failed');
          if (ok) setThanks({ giftCents: data.giftCents ?? null, label: data.designationLabel ?? null, monthly: data.mode === 'subscription' });
          // Counted on Stripe's confirmation, never on the click — a click is
          // intent, this is a gift that actually cleared — and once per gift,
          // not on every reload. value/currency/transaction_id are the GA4
          // fields Google Ads reads when this is imported as a conversion.
          if (ok && countConversionOnce(sessionId)) {
            track('donation_completed', {
              // The gift itself, not gift plus covered fee: what Ads should
              // optimise toward.
              value: data.giftCents ? data.giftCents / 100 : data.amountTotal ? data.amountTotal / 100 : undefined,
              currency: 'USD',
              transaction_id: sessionId,
              mode: data.mode,
            });
          }
        })
        .catch(() => setSuccess('failed'));
      return;
    }

    // ?designation=school:okemos or ?project=3, and links from before
    // designations existed: ?fund=Okemos Mid-Year Refill.
    const fromParam = decodeDesignation(params.get('designation'));
    const project = params.get('project');
    const legacy = designationFromLegacyFund(params.get('fund'));
    const chosen = fromParam && fromParam.kind !== 'general'
      ? fromParam
      : project && /^\d+$/.test(project) ? { kind: 'project' as const, id: Number(project) } : legacy;
    if (chosen) setDesignation(encodeDesignation(chosen));
    // Project links made before designations existed carried the project's
    // title (?fund=<title>). Matched against the projects once they load.
    else if (params.get('fund')) legacyFundTitle.current = params.get('fund');

    const f = params.get('frequency');
    if (f === 'monthly' || f === 'once') setFrequency(f);

    const a = params.get('amount');
    const n = a ? parseInt(a, 10) : NaN;
    if (!isNaN(n) && n >= MIN_GIFT && n <= MAX_GIFT) {
      setAmount(n);
      if (!TILES.some((t) => t.amount === n)) setOtherText(String(n));
    }
  }, []);

  /** "Other amount": dollars and cents, within the limits the Worker enforces. */
  const onOtherChange = (raw: string) => {
    const text = raw.replace(/[^0-9.]/g, '').slice(0, 9);
    setOtherText(text);
    if (!text) { setOtherError(null); setAmount(TILES[0].amount); return; }
    const value = Number(text);
    if (!/^\d+(\.\d{0,2})?$/.test(text) || !Number.isFinite(value)) {
      setOtherError('Enter an amount in dollars, like 40 or 40.50.');
    } else if (value < MIN_GIFT) {
      setOtherError(`The smallest gift we can take online is ${dollars(MIN_GIFT * 100)}.`);
    } else if (value > MAX_GIFT) {
      setOtherError('For a gift that large, email hello@fundingmichiganteachers.org and we will set it up with you.');
    } else {
      setOtherError(null);
      setAmount(Math.round(value * 100) / 100);
      return;
    }
    setAmount(0);
  };
  const selectedTile = otherText ? undefined : TILES.find((t) => t.amount === amount);

  const legacyFundTitle = useRef<string | null>(null);
  useEffect(() => {
    const title = legacyFundTitle.current?.trim().toLowerCase();
    if (!title) return;
    const match = projects.find((p) => p.title.trim().toLowerCase() === title);
    if (match) {
      setDesignation(`project:${match.id}`);
      legacyFundTitle.current = null;
    }
  }, [projects]);

  const canDonate = amount >= MIN_GIFT && amount <= MAX_GIFT && !otherError;
  const giftCents = Math.round(amount * 100);
  const feeCents = grossUp(giftCents).feeCents;
  // Fee coverage only applies to the embedded checkout; the hosted-link
  // fallback cannot carry it, so it shows the plain amount.
  const totalCents = embeddedReady && coverFee ? giftCents + feeCents : giftCents;

  /** What the gift is going to, in words, for the checkout header. */
  const designationLabel = (() => {
    const d = decodeDesignation(designation);
    if (!d || d.kind === 'general') return 'Funding Michigan Teachers';
    if (d.kind === 'school') return schoolFundLabel(d.slug) ?? 'Funding Michigan Teachers';
    const p = projects.find((x) => x.id === d.id);
    return p ? `${p.teacher_name}'s classroom` : 'a classroom project';
  })();

  const handleDonateClick = () => {
    if (!canDonate) return;
    // The step before payment, so the funnel shows where people stop.
    track('donate_checkout_opened', {
      value: amount,
      currency: 'USD',
      frequency,
      cover_fee: coverFee,
      designation: designation.split(':')[0],
    });
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
              <p className="text-chalkboard/70">Confirming your donation…</p>
            </>
          )}
          {success === 'confirmed' && <DonationThanks thanks={thanks} />}
          {success === 'failed' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pencil/15 flex items-center justify-center">
                <AlertCircle size={30} className="text-pencil-dark" />
              </div>
              <h1 className="font-serif font-bold text-3xl mb-3">Couldn't confirm that.</h1>
              <p className="text-chalkboard/70 leading-relaxed mb-8">
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

      <SiteHeader />

      {/* Ambient brand glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/[0.06] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pencil/[0.08] rounded-full blur-[160px]" />

      <main id="main" className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">

          {/* HEADER — editorial split */}
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            {/* Paints at once (see the homepage hero): donate is an ad
                landing page, and its headline is its largest text. */}
            <motion.div
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-white/85 ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[0.625rem] font-bold mb-7 uppercase tracking-[0.24em] text-chalkboard/70 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <span className="w-1.5 h-1.5 rounded-full bg-apple" />
                Apple Pay · Google Pay · Card · 3 clicks
              </div>
              <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.025em] mb-7 text-[clamp(2.5rem,5vw,4.5rem)]">
                Make this <span className="text-apple italic font-normal">real</span> for a Michigan teacher.
              </h1>
              <p className="text-lg text-chalkboard/70 max-w-xl leading-relaxed font-light mb-5">
                Pick an amount and where it goes, then pay with Apple Pay, Google Pay or a card. At least 80¢ of every dollar goes to teachers.
              </p>
              <div className="inline-flex items-center gap-2 bg-chalkboard/5 text-chalkboard/70 px-4 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-pencil-dark" />
                2026–27 School Year Goal: $20,000
              </div>
            </motion.div>

            {/* Trust signals card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="hidden lg:block lg:col-span-5"
            >
              <TrustCard />
            </motion.div>
          </div>

          {/* THE GIVING PANEL. Everything needed to give sits together, above
              the impact visualizer: on a phone the Donate button used to be
              more than three screens down, under the visualizer, which is a
              poor first screen for someone arriving from an ad. */}
          <section aria-labelledby="give-heading" className="max-w-3xl mx-auto mb-14">
            <h2 id="give-heading" className="sr-only">Make your gift</h2>

            {/* Where the gift goes. A native select: the most accessible
                picker there is, and on a phone it opens the system list. */}
            <div className="mb-7">
              <label
                htmlFor="donate-designation"
                className="flex items-center justify-center gap-2 text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2.5"
              >
                <School size={13} strokeWidth={1.75} aria-hidden="true" />
                Where should your gift go?
              </label>
              <select
                id="donate-designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                aria-describedby="designation-note"
                className="w-full max-w-xl mx-auto block bg-white ring-1 ring-chalkboard/15 focus:ring-2 focus:ring-apple/40 rounded-2xl px-5 py-3.5 text-base font-bold text-chalkboard outline-none"
              >
                <option value="general">Where it's needed most</option>
                {/* A link can name a project before the list has loaded, or one
                    that has since closed. Without this option the box would show
                    "Where it's needed most" while the gift went to the project.
                    The Worker checks the project exists before charging. */}
                {designation.startsWith('project:') && !projects.some((p) => `project:${p.id}` === designation) && (
                  <option value={designation}>The classroom project you came from</option>
                )}
                {projects.length > 0 && (
                  <optgroup label="A teacher's classroom project">
                    {projects.map((p) => (
                      <option key={p.id} value={`project:${p.id}`}>
                        {p.teacher_name} — {p.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="A school's Mid-Year Refill (January)">
                  {schoolFunds().map((f) => (
                    <option key={f.slug} value={`school:${f.slug}`}>{f.label}</option>
                  ))}
                </optgroup>
              </select>
              {/* Variance power. Under IRS rules a gift earmarked for a person
                  is not deductible; the charity must keep control of how it is
                  used. So a choice here is a preference FMT honours, and the
                  page says what happens when it cannot be. */}
              <p id="designation-note" className="text-xs text-chalkboard/70 text-center mt-2.5 max-w-xl mx-auto leading-relaxed">
                {designation === 'general'
                  ? 'We put it where teachers need it most right now.'
                  : 'We honour your choice. If that project or refill is already fully funded, your gift goes where it is needed most. FMT makes the final decision on every gift.'}
              </p>
            </div>

            {/* Frequency */}
            <div className="flex justify-center mb-7">
              <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/10 rounded-full p-1 flex items-center gap-1" role="group" aria-label="How often">
                {(['once', 'monthly'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    aria-pressed={frequency === f}
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
                    <span className={cn('relative z-10', frequency === f ? 'text-white' : 'text-chalkboard/75')}>
                      {f === 'monthly' ? 'Monthly' : 'One-time'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount: five suggestions and a box for any other amount. */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3 mb-3" role="group" aria-label="Choose an amount">
              {TILES.map((tile) => {
                const selected = amount === tile.amount && !otherText;
                return (
                  <button
                    key={tile.label}
                    onClick={() => { setOtherText(''); setAmount(tile.amount); }}
                    aria-pressed={selected}
                    className={cn(
                      'text-left rounded-2xl p-3.5 sm:p-4 ring-1 bg-white transition-shadow',
                      selected ? 'ring-2 ring-apple shadow-[0_6px_20px_rgba(192,57,43,0.12)]' : 'ring-chalkboard/15 hover:ring-chalkboard/35',
                    )}
                  >
                    <span className="block font-serif font-bold text-2xl sm:text-3xl leading-none tracking-[-0.02em] text-chalkboard">
                      ${tile.amount}
                    </span>
                    <span className="block text-[0.625rem] uppercase tracking-[0.14em] font-bold text-chalkboard/70 mt-1.5 leading-tight">{tile.label}</span>
                  </button>
                );
              })}
              <div className={cn(
                'rounded-2xl p-3.5 sm:p-4 ring-1 bg-white flex flex-col justify-center',
                otherText ? 'ring-2 ring-apple' : 'ring-chalkboard/15',
              )}>
                <label htmlFor="donate-other" className="text-[0.625rem] uppercase tracking-[0.14em] font-bold text-chalkboard/70 mb-1">
                  Other amount
                </label>
                <div className="flex items-center">
                  <span className="font-serif font-bold text-xl text-chalkboard mr-0.5" aria-hidden="true">$</span>
                  <input
                    id="donate-other"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Any"
                    value={otherText}
                    onChange={(e) => onOtherChange(e.target.value)}
                    aria-invalid={otherError ? true : undefined}
                    aria-describedby={otherError ? 'donate-other-error' : undefined}
                    className="w-full min-w-0 bg-transparent font-serif font-bold text-xl text-chalkboard outline-none placeholder:text-chalkboard/65 placeholder:font-sans placeholder:text-base placeholder:font-normal"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-chalkboard/70 text-center mb-6 min-h-[1.25rem]" aria-live="polite">
              {otherError
                ? <span id="donate-other-error" className="text-apple font-bold">{otherError}</span>
                : selectedTile?.impact ?? ''}
            </p>

            {/* The supply basket: supplies drop in, tumble and settle as the
                amount goes up. It sits right under the tiles so each choice
                can be seen landing; inside the visualizer further down, it
                was out of sight of the tiles. Decorative, so hidden from
                screen readers: the amount is on the tiles and the button. */}
            <div className="max-w-md mx-auto mb-6" aria-hidden="true">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70">
                  Your supply basket
                </span>
                <span className="font-hand text-sm text-chalkboard/70 -rotate-1">
                  {amount >= 250 ? 'overflowing!!' : amount >= 100 ? 'filling up fast' : 'watch it fill…'}
                </span>
              </div>
              <SupplyBasket amount={amount} />
            </div>

            {/* Cover the fee. The exact dollar amount is shown, so a pre-ticked
                box is a visible choice rather than a surprise on the receipt.
                Worded by what it does: in donor tests, "fee" language cost
                gifts. */}
            {embeddedReady && canDonate && (
              <label className="max-w-md mx-auto mb-6 flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={coverFee}
                  onChange={(e) => setCoverFee(e.target.checked)}
                  className="mt-0.5 w-5 h-5 shrink-0 accent-apple"
                />
                <span className="text-sm text-chalkboard/75 leading-snug">
                  Add <strong className="text-chalkboard">{dollars(feeCents)}</strong>
                  {frequency === 'monthly' ? ' a month' : ''} so your whole {dollars(giftCents)} reaches
                  teachers. It covers what the card company charges us.
                </span>
              </label>
            )}

            {/* What the button is about to do, in one line. */}
            {canDonate && (
              <p className="text-center text-sm text-chalkboard/75 mb-4">
                Going to <strong className="text-chalkboard">{designationLabel === 'Funding Michigan Teachers' ? 'where it\'s needed most' : designationLabel}</strong>
                {designation !== 'general' && (
                  <>
                    {' · '}
                    <button
                      onClick={() => document.getElementById('donate-designation')?.focus()}
                      className="text-ruler underline underline-offset-2"
                    >
                      change
                    </button>
                  </>
                )}
              </p>
            )}

            {/* PRIMARY CTA — opens embedded Stripe checkout inline (or falls back) */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleDonateClick}
                disabled={!canDonate}
                className={cn(
                  'group flex items-center gap-3 pl-9 pr-2 py-2.5 rounded-full font-bold text-base shadow-[0_18px_40px_rgba(192,57,43,0.35)] active:scale-[0.98]',
                  canDonate ? 'bg-apple text-white' : 'bg-chalkboard/20 text-chalkboard/70 pointer-events-none',
                )}
                style={{ transition: 'all 700ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <Heart size={18} strokeWidth={1.5} className="fill-current" aria-hidden="true" />
                <span className="uppercase tracking-[0.18em] text-sm whitespace-nowrap">
                  Donate {dollars(totalCents)}{frequency === 'monthly' ? '/mo' : ''}
                </span>
                <span className="w-11 h-11 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-all">
                  <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </span>
              </button>
            </div>

            {/* A monthly donor should know before giving how to stop. */}
            {frequency === 'monthly' && (
              <p className="text-center text-xs text-chalkboard/70 mb-4">
                Change or cancel a monthly gift any time: email{' '}
                <a href="mailto:hello@fundingmichiganteachers.org?subject=My%20monthly%20gift" className="text-apple underline">hello@fundingmichiganteachers.org</a>.
              </p>
            )}
          </section>

          {/* Payment method indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-12 text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70"
          >
            <span className="flex items-center gap-1.5">
              <AppleIcon size={11} strokeWidth={1.5} />
              Apple Pay
            </span>
            <span className="w-1 h-1 rounded-full bg-chalkboard/15" />
            <span>Google Pay</span>
            <span className="w-1 h-1 rounded-full bg-chalkboard/15" />
            <span>Card</span>
          </motion.div>

          {/* What the gift becomes, live with the amount chosen above. */}
          <div className="mb-12">
            <ImpactVisualizer amount={amount} onAmountChange={(n) => { setOtherText(''); setAmount(n); }} frequency={frequency} />
          </div>

          {/* On a phone the trust card follows the giving panel, so the panel
              comes first. */}
          <div className="lg:hidden max-w-md mx-auto mb-12">
            <TrustCard />
          </div>

          {/* If checkout is ever unconfigured, visitors get a human path —
              never internal setup instructions, which this box used to print
              on a public page. */}
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
                  <p className="font-bold text-chalkboard mb-1">Online giving is temporarily unavailable.</p>
                  <p>
                    We're sorry — card donations aren't going through right now. Email{' '}
                    <a href="mailto:hello@fundingmichiganteachers.org" className="text-apple underline font-bold">
                      hello@fundingmichiganteachers.org
                    </a>{' '}
                    and we'll make sure your gift reaches a Michigan classroom.
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
            <p className="text-[0.625rem] uppercase tracking-[0.28em] font-bold text-chalkboard/70 mb-4">Not ready to give today?</p>
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
            designation={designation}
            designationLabel={designationLabel}
            coverFee={coverFee}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The thank-you screen. It used to offer only "Back to Home". A donor who has
 * just given is the most likely person to share, to give again and to want
 * to hear what happened, so it now asks for each of those once.
 */
function DonationThanks({ thanks }: { thanks: { giftCents: number | null; label: string | null; monthly: boolean } | null }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [signup, setSignup] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  const to = thanks?.label && thanks.label !== 'Funding Michigan Teachers' ? thanks.label : 'Funding Michigan Teachers';
  const amount = thanks?.giftCents ? dollars(thanks.giftCents) : null;
  const shareUrl = 'https://www.fundingmichiganteachers.org/donate';

  const share = async () => {
    const text = 'I just gave to Funding Michigan Teachers, a student-led nonprofit that restocks classrooms and feeds teachers at staff meetings.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Funding Michigan Teachers', text, url: shareUrl });
        track('donation_shared', { method: 'native' });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      track('donation_shared', { method: 'copy' });
    } catch {
      /* the visitor closed the share sheet */
    }
  };

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignup('loading');
    setSignup((await subscribeToImpactReport(email, 'donation-thanks')) ? 'done' : 'error');
  };

  return (
    <div className="text-left">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-apple/10 flex items-center justify-center">
        <CheckCircle2 size={30} className="text-apple" aria-hidden="true" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="font-serif font-bold text-3xl mb-3 text-center outline-none">Thank you.</h1>
      <p className="text-chalkboard/75 leading-relaxed mb-2 text-center">
        Your {amount ? `${amount} ` : ''}{thanks?.monthly ? 'monthly gift' : 'gift'} to {to} went through, and a receipt is on its way to your inbox.
      </p>
      <p className="text-xs text-chalkboard/70 leading-relaxed mb-8 text-center">
        Funding Michigan Teachers is a 501(c)(3), EIN 93-4485967. You received no goods or services for this gift,
        which is tax-deductible to the extent allowed by law.
      </p>

      <div className="space-y-3">
        <div className="bg-white ring-1 ring-chalkboard/10 rounded-2xl p-5">
          <p className="font-bold text-sm mb-1">Pass it on</p>
          <p className="text-sm text-chalkboard/75 mb-3">Most gifts happen because someone was asked. A share from you counts.</p>
          <button onClick={share} className="bg-chalkboard text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-apple transition-colors">
            {copied ? 'Link copied' : 'Share FMT'}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? 'Link copied to clipboard' : ''}</span>
        </div>

        <div className="bg-white ring-1 ring-chalkboard/10 rounded-2xl p-5">
          <p className="font-bold text-sm mb-1">See what your gift did</p>
          {signup === 'done' ? (
            <p className="text-sm text-chalkboard/75" role="status">You're on the list for the Impact Report.</p>
          ) : (
            <form onSubmit={join} className="flex gap-2 mt-2">
              <label htmlFor="thanks-email" className="sr-only">Email address</label>
              <input
                id="thanks-email" type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 min-w-0 bg-paper ring-1 ring-chalkboard/20 rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:text-chalkboard/65"
              />
              <button type="submit" disabled={signup === 'loading'} className="px-4 rounded-xl bg-apple text-white font-bold text-sm disabled:opacity-60">
                Get updates
              </button>
            </form>
          )}
          {signup === 'error' && <p className="text-xs text-apple font-bold mt-2" role="alert">That didn't go through. Email hello@fundingmichiganteachers.org and we'll add you.</p>}
        </div>

        <div className="bg-white ring-1 ring-chalkboard/10 rounded-2xl p-5">
          <p className="font-bold text-sm mb-1">Does your employer match gifts?</p>
          <p className="text-sm text-chalkboard/75">
            Many do. Ask your HR team and give them our EIN, 93-4485967.
            {!thanks?.monthly && (
              <>
                {' '}Or{' '}
                <a
                  href={`/donate?frequency=monthly${thanks?.giftCents ? `&amount=${Math.round(thanks.giftCents / 100)}` : ''}`}
                  className="text-apple font-bold underline"
                >
                  make it a monthly gift
                </a>.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="inline-flex items-center gap-2 text-sm font-bold text-chalkboard/75 hover:text-chalkboard">
          Back to the homepage <ArrowRight size={13} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

/** Why donate here: deductibility, where it goes, who handles the card. */
function TrustCard() {
  return (
    <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                <div className="bg-white rounded-[calc(2rem-0.5rem)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-5">Why donate here</p>
                  <ul className="space-y-3.5">
                    {[
                      { i: Shield, t: 'Tax-deductible', s: '501(c)(3), EIN 93-4485967, to the extent allowed by law' },
                      { i: Sparkles, t: 'Direct to teachers', s: 'Funds classrooms, meals, and appreciation events' },
                      { i: CreditCard, t: 'Paid through Stripe', s: 'Your card number goes to Stripe; we never see or store it' },
                    ].map((row) => (
                      <li key={row.t} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-apple/10 text-apple flex items-center justify-center shrink-0 mt-0.5">
                          <row.i size={14} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-chalkboard">{row.t}</p>
                          <p className="text-xs text-chalkboard/70 mt-0.5 font-light leading-snug">{row.s}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
  );
}
