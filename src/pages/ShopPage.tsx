import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import {
  X, Plus, Minus, MapPin, Truck, CheckCircle2, AlertCircle, GraduationCap, Ticket, Loader2,
  ShoppingBag, Check, Shield, ArrowRight,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/analytics';
import { useModalDialog } from '../lib/useModalDialog';
import { STRIPE_PUBLISHABLE_KEY } from '../lib/donate';
import { MERCH_PHOTOS } from '../data/merchPhotos';
import {
  MERCH, MERCH_COLORS, MERCH_SIZES, priceOrder, formatPrice, findProduct,
  FREE_DELIVERY_OVER, DELIVERY_FEE,
  type CartLine, type CodeKind, type Fulfilment, type MerchSize, type MerchColor, type MerchProduct,
} from '../../shared/merch';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;
const ORDER_EMAIL = 'hello@fundingmichiganteachers.org';

/**
 * "Cover the card fee" starts ticked, as on the donate page — the founder's
 * call (October 2026). It is optional, itemized, and the buyer can untick it.
 */
const COVER_FEE_DEFAULT = true;

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * What a shirt actually pays for. Names the program rather than counting
 * supplies: a count would only be as honest as the cost estimates behind it,
 * and it publishes the margin sideways.
 */
const IMPACT_NOTE =
  'Shirt sales pay for supply restocks — the box that turns up when a classroom runs out of markers in February.';

/** Per-product picker state, before the item is added to the order. */
interface Picker { size: MerchSize; colorId: string; }

/**
 * A card opens on the colorway in its photo, so the photo and the selected
 * swatch agree until the shopper changes it.
 */
function defaultColorId(productId: string): string {
  const pictured = MERCH_PHOTOS[productId]?.colorId;
  return pictured && MERCH_COLORS.some((c) => c.id === pictured) ? pictured : MERCH_COLORS[0].id;
}

function swatchStyle(c: MerchColor): React.CSSProperties {
  return {
    background: c.speckle
      ? `radial-gradient(circle at 30% 30%, #5a5a5e 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, #5a5a5e 1px, transparent 1.5px), ${c.hex}`
      : c.hex,
  };
}

/**
 * The product photo, always — whichever colorway is selected.
 *
 * This used to swap in a hand-drawn garment for any colorway without a photo,
 * so two of three swatches on every card turned the photo into a drawing.
 * Shops that have not shot every colorway do what this does instead: show
 * the photo they have and say which colorway it is ("Shown in White").
 *
 * If the file fails to load, the product name stands in, never a broken-image
 * icon.
 */
function ProductPhoto({ product, className = '', priority = false }: { product: MerchProduct; className?: string; priority?: boolean }) {
  const photo = MERCH_PHOTOS[product.id];
  const [failed, setFailed] = useState(false);
  if (!photo || failed) {
    return (
      <div className={`flex items-center justify-center text-center p-4 font-serif font-bold text-chalkboard/70 ${className}`}>
        {product.name}
      </div>
    );
  }
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      // The first card's photo is the largest thing on a phone's first
      // screen, so it loads first rather than lazily.
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

// ── Checkout dialog ─────────────────────────────────────────────────────────

function MerchCheckout({ lines, fulfilment, code, educator, coverFee, total, onClose }: {
  lines: CartLine[]; fulfilment: Fulfilment; code: string; educator: boolean; coverFee: boolean;
  total: number; onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stripePromise?.catch(() =>
      setError("Couldn't load the secure checkout. Check your connection, or any script blocker."));
  }, []);

  const dialogRef = useRef<HTMLDivElement>(null);
  useModalDialog(dialogRef, onClose);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/create-merch-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Ids, sizes, quantities and two yes/no answers. Never a price.
      body: JSON.stringify({ lines, fulfilment, code, educator, coverFee }),
    });
    const data = (await res.json().catch(() => ({}))) as { clientSecret?: string; error?: string };
    if (!res.ok || !data.clientSecret) {
      setError(data.error || 'Could not start checkout. Please try again.');
      throw new Error(data.error || 'merch session failed');
    }
    return data.clientSecret;
  }, [lines, fulfilment, code, educator, coverFee]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: EASE }}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="merch-checkout-title"
        className="bg-white rounded-[2rem] w-full max-w-lg max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="bg-chalkboard px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p id="merch-checkout-title" className="text-white font-bold text-sm">Pay {formatPrice(total)}</p>
            <p className="text-white/70 text-[0.625rem] uppercase tracking-[0.18em] font-bold mt-0.5 flex items-center gap-1.5">
              <Shield size={10} strokeWidth={1.5} aria-hidden="true" />
              Secure checkout by Stripe
            </p>
          </div>
          <button onClick={onClose} aria-label="Close checkout" className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto bg-paper/40">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle size={22} className="text-apple mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-chalkboard/80 leading-relaxed" role="alert">{error}</p>
              <a href={`mailto:${ORDER_EMAIL}`} className="inline-block mt-4 text-sm font-bold text-apple underline">
                Order by email instead
              </a>
            </div>
          ) : stripePromise ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <p className="p-8 text-center text-sm text-chalkboard/75">
              Online payment isn't configured. Email{' '}
              <a href={`mailto:${ORDER_EMAIL}`} className="text-apple underline">{ORDER_EMAIL}</a>{' '}
              and we'll sort your order out.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

// ── Product card ────────────────────────────────────────────────────────────

function ProductCard({ product, index, pick, educator, onPick, onAdd }: {
  product: MerchProduct;
  index: number;
  pick: Picker;
  educator: boolean;
  onPick: (patch: Partial<Picker>) => void;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const color = MERCH_COLORS.find((c) => c.id === pick.colorId)!;
  const photo = MERCH_PHOTOS[product.id];
  const shownIn = photo ? MERCH_COLORS.find((c) => c.id === photo.colorId)?.name : undefined;
  const price = educator ? product.cost : product.price;

  const add = () => {
    onAdd();
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
      aria-labelledby={`product-${product.id}`}
      className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col"
    >
      {/* Portrait box: the photos are full-length shots. */}
      <div className="relative aspect-[4/5] bg-paper">
        <ProductPhoto product={product} className="w-full h-full" priority={index === 0} />
        {shownIn && (
          <span className="absolute left-3 bottom-3 bg-white/90 backdrop-blur-sm text-chalkboard text-[0.625rem] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full">
            Shown in {shownIn}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id={`product-${product.id}`} className="font-serif font-bold text-lg leading-snug">{product.name}</h2>
          <p className="font-serif font-bold text-xl tabular-nums shrink-0">{formatPrice(price)}</p>
        </div>
        <p className="text-sm text-chalkboard/70 mt-1 mb-4 leading-snug">
          {product.blurb}
          {educator && <span className="text-apple font-bold"> Educator pricing.</span>}
        </p>

        {/* Native radios, drawn as swatches: arrow keys move between them and
            a screen reader hears "Navy, radio button, 3 of 3". */}
        <fieldset className="mb-4">
          <legend className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2">
            Color: <span className="text-chalkboard">{color.name}</span>
          </legend>
          <div className="flex gap-2.5">
            {MERCH_COLORS.map((c) => (
              <label key={c.id} className="cursor-pointer">
                <input
                  type="radio"
                  name={`color-${product.id}`}
                  value={c.id}
                  checked={c.id === pick.colorId}
                  onChange={() => onPick({ colorId: c.id })}
                  className="sr-only peer"
                />
                <span className="sr-only">{c.name}</span>
                <span
                  aria-hidden="true"
                  className="block w-8 h-8 rounded-full ring-1 ring-chalkboard/20 ring-offset-2 ring-offset-white transition-shadow peer-checked:ring-2 peer-checked:ring-apple peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ruler"
                  style={swatchStyle(c)}
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-5">
          <legend className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2">Size</legend>
          <div className="grid grid-cols-5 gap-1.5">
            {MERCH_SIZES.map((sz) => (
              <label key={sz} className="cursor-pointer">
                <input
                  type="radio"
                  name={`size-${product.id}`}
                  value={sz}
                  checked={sz === pick.size}
                  onChange={() => onPick({ size: sz })}
                  className="sr-only peer"
                />
                <span className="block text-center py-2 rounded-lg text-xs font-bold bg-paper text-chalkboard/80 hover:bg-chalkboard/10 transition-colors peer-checked:bg-chalkboard peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ruler">
                  {sz}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          onClick={add}
          className={`mt-auto w-full py-3 rounded-xl font-bold text-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2 ${
            added ? 'bg-chalkboard text-white' : 'bg-apple text-white hover:bg-apple/90'
          }`}
        >
          {added ? <><Check size={15} strokeWidth={2.5} aria-hidden="true" /> Added</> : <>Add to order</>}
        </button>
      </div>
    </motion.article>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

type Confirmation = null | 'checking' | 'confirmed' | 'failed';

export default function ShopPage() {
  const [pickers, setPickers] = useState<Record<string, Picker>>(() =>
    Object.fromEntries(MERCH.map((p) => [p.id, { size: 'M' as MerchSize, colorId: defaultColorId(p.id) }])));
  const [cart, setCart] = useState<CartLine[]>([]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>('pickup');
  const [educator, setEducator] = useState(false);
  const [coverFee, setCoverFee] = useState(COVER_FEE_DEFAULT);
  const [checkingOut, setCheckingOut] = useState(false);
  // Codes are checked by the server; the page never knows what any code is,
  // only what the server says about the one that was typed.
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [code, setCode] = useState<{ value: string; kind: CodeKind; label: string } | null>(null);
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'bad'>('idle');
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [announce, setAnnounce] = useState('');
  const [panelInView, setPanelInView] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'Shop — FMT Merch | Funding Michigan Teachers',
      description:
        'FMT t-shirts, crewnecks and hoodies, printed locally and hand-pressed by our students. What\'s left after materials buys classroom supplies.',
      path: '/shop',
    });
    const sessionId = new URLSearchParams(window.location.search).get('stripe_session_id');
    if (sessionId) {
      setConfirmation('checking');
      fetch(`/api/checkout-session-status?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data: { status?: string; paymentStatus?: string; amountTotal?: number }) => {
          const ok = data.status === 'complete' || data.paymentStatus === 'paid';
          setConfirmation(ok ? 'confirmed' : 'failed');
          if (ok) track('merch_purchase_completed', { value: data.amountTotal ? data.amountTotal / 100 : undefined });
        })
        .catch(() => setConfirmation('failed'));
    }
  }, []);

  // The bar at the bottom of a phone screen hides while the order itself is
  // on screen.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPanelInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [confirmation]);

  const priced = priceOrder(cart, { fulfilment, educator, codeKind: code?.kind ?? null, coverFee });
  const feeIfCovered = priceOrder(cart, { fulfilment, educator, codeKind: code?.kind ?? null, coverFee: true }).fee;
  const itemCount = cart.reduce((n, l) => n + l.qty, 0);
  const effectiveEducator = educator || code?.kind === 'educator';

  const addToOrder = (product: MerchProduct) => {
    const pick = pickers[product.id];
    const color = MERCH_COLORS.find((c) => c.id === pick.colorId)!;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === product.id && l.size === pick.size && l.colorId === pick.colorId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(10, next[i].qty + 1) };
        return next;
      }
      return [...prev, { productId: product.id, size: pick.size, colorId: pick.colorId, qty: 1 }];
    });
    setAnnounce(`Added ${product.name}, ${color.name}, size ${pick.size}, to your order.`);
    track('merch_added_to_order', { item: product.id });
  };

  const setQty = (i: number, qty: number) =>
    setCart((prev) => (qty < 1 ? prev.filter((_, idx) => idx !== i) : prev.map((l, idx) => (idx === i ? { ...l, qty: Math.min(10, qty) } : l))));

  const applyCode = async () => {
    const entered = codeInput.trim();
    if (!entered) return;
    setCodeState('checking');
    try {
      const res = await fetch('/api/check-merch-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: entered }),
      });
      const data = (await res.json()) as { valid?: boolean; kind?: CodeKind; label?: string };
      if (data.valid && data.kind) {
        setCode({ value: entered.toUpperCase(), kind: data.kind, label: data.label ?? '' });
        setCodeState('idle');
        setCodeInput('');
      } else {
        setCodeState('bad');
      }
    } catch {
      setCodeState('bad');
    }
  };

  const reviewOrder = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    headingRef.current?.focus({ preventScroll: true });
  };

  const startCheckout = () => {
    track('merch_checkout_started', { value: priced.total / 100 });
    setCheckingOut(true);
  };

  /** A free tee on its own costs $0, which Stripe cannot take: it is claimed by email. */
  const freeClaimHref = () => {
    const lines = cart.map((l) => {
      const p = findProduct(l.productId)!;
      const c = MERCH_COLORS.find((x) => x.id === l.colorId)!;
      return `${l.qty} x ${p.name}, ${c.name}, ${l.size}`;
    });
    const body = [
      `Code: ${code?.value ?? ''}`,
      ...lines,
      `Pickup or delivery: ${fulfilment}`,
      '',
      'Name:',
      'School:',
    ].join('\n');
    return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('My free FMT tee')}&body=${encodeURIComponent(body)}`;
  };

  if (confirmation) {
    return (
      <div className="min-h-[100dvh] bg-paper flex flex-col">
        <SiteHeader />
        <main id="main" className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md text-center" role="status">
            {confirmation === 'checking' && (
              <>
                <Loader2 className="animate-spin text-apple mx-auto mb-5" size={30} aria-hidden="true" />
                <p className="text-chalkboard/70">Confirming your order…</p>
              </>
            )}
            {confirmation === 'confirmed' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>
                <h1 className="font-serif font-bold text-3xl mb-3">Order in.</h1>
                <p className="text-chalkboard/75 font-light leading-relaxed mb-7">
                  Thank you — a receipt is on its way to your inbox. We press every order by hand, so
                  give us a few days; we'll email you when yours is ready and sort out pickup or delivery.
                </p>
              </>
            )}
            {confirmation === 'failed' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-pencil/15 text-pencil-dark flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={26} aria-hidden="true" />
                </div>
                <h1 className="font-serif font-bold text-3xl mb-3">Couldn't confirm that.</h1>
                <p className="text-chalkboard/75 font-light leading-relaxed mb-7">
                  We couldn't verify this order. If you were charged, your Stripe receipt is your proof
                  and we'll honour it — email {ORDER_EMAIL} and we'll sort it out.
                </p>
              </>
            )}
            {confirmation !== 'checking' && (
              <button onClick={() => { setConfirmation(null); navigate('/shop'); }} className="bg-chalkboard text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-apple transition-colors">
                Back to the shop
              </button>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      {/* Announces each add, for anyone who cannot see the order update. */}
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>

      <main id="main" className="relative z-10 flex-1 px-4 sm:px-6 pt-28 sm:pt-36 pb-28 xl:pb-20">
        <div className="pointer-events-none absolute top-0 left-0 w-[560px] h-[560px] bg-pencil/[0.08] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/4" />

        <div className="max-w-7xl mx-auto relative">
          <motion.header
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-2xl mb-10 sm:mb-12"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-4">
              Printed locally · Pressed by students
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.03] tracking-[-0.02em] mb-4 text-balance">
              Wear it. <span className="text-apple italic font-normal">Fund it.</span>
            </h1>
            <p className="text-lg text-chalkboard/75 font-light leading-relaxed">
              Swift Prints makes our film here in town, and our students heat-press every shirt one
              at a time. What's left after materials buys pencils, markers and tissues for classrooms
              that ran out.
            </p>
          </motion.header>

          <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
            {/* Products */}
            <section aria-label="Products" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MERCH.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  pick={pickers[product.id]}
                  educator={effectiveEducator}
                  onPick={(patch) => setPickers((prev) => ({ ...prev, [product.id]: { ...prev[product.id], ...patch } }))}
                  onAdd={() => addToOrder(product)}
                />
              ))}
            </section>

            {/* The order. Beside the products on a wide screen, so adding
                something visibly lands; below them on anything narrower, with
                the bar at the bottom of the screen pointing to it. */}
            <aside
              ref={panelRef}
              aria-labelledby="order-heading"
              className="xl:sticky xl:top-28 scroll-mt-28"
            >
              <div className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)] p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <h2 id="order-heading" ref={headingRef} tabIndex={-1} className="font-serif font-bold text-2xl outline-none">
                    Your order
                  </h2>
                  {itemCount > 0 && (
                    <span className="text-xs font-bold text-chalkboard/70">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-8 text-center border-t border-chalkboard/10">
                    <ShoppingBag size={22} className="mx-auto text-chalkboard/70 mb-3" aria-hidden="true" />
                    <p className="text-sm text-chalkboard/70 leading-relaxed">
                      Nothing here yet. Pick a color and size, then <strong className="font-bold text-chalkboard">Add to order</strong>.
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="border-t border-chalkboard/10 mb-5">
                      {cart.map((l, i) => {
                        const prod = findProduct(l.productId)!;
                        const col = MERCH_COLORS.find((x) => x.id === l.colorId)!;
                        const unit = effectiveEducator ? prod.cost : prod.price;
                        return (
                          <li key={`${l.productId}-${l.size}-${l.colorId}`} className="flex items-center gap-3 py-3 border-b border-chalkboard/10">
                            <span className="w-12 h-14 shrink-0 bg-paper rounded-lg overflow-hidden block">
                              <ProductPhoto product={prod} className="w-full h-full text-[0.625rem]" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-bold leading-snug">{prod.name}</span>
                              <span className="flex items-center gap-1.5 text-xs text-chalkboard/70 mt-0.5">
                                <span className="w-2.5 h-2.5 rounded-full ring-1 ring-chalkboard/20 shrink-0" style={swatchStyle(col)} aria-hidden="true" />
                                {col.name} · {l.size}
                              </span>
                              <span className="mt-1.5 inline-flex items-center gap-0.5 bg-paper rounded-lg p-0.5">
                                <button onClick={() => setQty(i, l.qty - 1)} aria-label={`One fewer ${prod.name}, ${col.name}, ${l.size}`}
                                  className="w-7 h-7 rounded-md hover:bg-chalkboard/10 flex items-center justify-center">
                                  <Minus size={12} aria-hidden="true" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold tabular-nums" aria-label={`Quantity ${l.qty}`}>{l.qty}</span>
                                <button onClick={() => setQty(i, l.qty + 1)} disabled={l.qty >= 10} aria-label={`One more ${prod.name}, ${col.name}, ${l.size}`}
                                  className="w-7 h-7 rounded-md hover:bg-chalkboard/10 flex items-center justify-center disabled:opacity-30">
                                  <Plus size={12} aria-hidden="true" />
                                </button>
                              </span>
                            </span>
                            <span className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-sm font-bold tabular-nums">{formatPrice(unit * l.qty)}</span>
                              <button onClick={() => setQty(i, 0)} className="text-xs text-chalkboard/70 hover:text-apple underline underline-offset-2">
                                Remove<span className="sr-only"> {prod.name}, {col.name}, {l.size}</span>
                              </button>
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <fieldset className="mb-5">
                      <legend className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2">Pickup or delivery</legend>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { id: 'pickup' as const, icon: MapPin, title: 'Pickup', price: 'Free', body: 'At your school or one of our events.' },
                          { id: 'delivery' as const, icon: Truck, title: 'Delivery', price: formatPrice(DELIVERY_FEE), body: `Free over ${formatPrice(FREE_DELIVERY_OVER)}.` },
                        ]).map((opt) => (
                          <label key={opt.id} className="cursor-pointer">
                            <input type="radio" name="fulfilment" value={opt.id} checked={fulfilment === opt.id}
                              onChange={() => setFulfilment(opt.id)} className="sr-only peer" />
                            <span className="block h-full p-3 rounded-xl ring-1 ring-chalkboard/15 hover:ring-chalkboard/35 transition-all peer-checked:ring-2 peer-checked:ring-apple peer-checked:bg-apple/[0.04] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ruler">
                              <span className="flex items-center justify-between gap-1 text-sm font-bold">
                                <span className="flex items-center gap-1.5"><opt.icon size={13} className="text-apple" aria-hidden="true" />{opt.title}</span>
                                <span className="text-xs">{opt.price}</span>
                              </span>
                              <span className="block text-xs text-chalkboard/70 leading-snug mt-1">{opt.body}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Educator pricing: an honour-system box. It deliberately
                        says nothing about what we make on a shirt. */}
                    <label className="flex items-start gap-3 mb-3 cursor-pointer">
                      <input
                        type="checkbox" id="educator-pricing" name="educator"
                        checked={educator} onChange={(e) => setEducator(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#c0392b] shrink-0"
                      />
                      <span className="text-sm text-chalkboard/80 leading-snug">
                        <GraduationCap size={14} className="inline text-apple mr-1 -mt-0.5" aria-hidden="true" />
                        I'm a teacher or school staff member: <strong className="font-semibold text-chalkboard">educator pricing</strong>
                      </span>
                    </label>

                    {feeIfCovered > 0 ? (
                      <label className="flex items-start gap-3 mb-4 cursor-pointer">
                        <input
                          type="checkbox" id="merch-cover-fee" name="coverFee"
                          checked={coverFee} onChange={(e) => setCoverFee(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#c0392b] shrink-0"
                        />
                        <span className="text-sm text-chalkboard/80 leading-snug">
                          Add {formatPrice(feeIfCovered)} to cover the card processing fee, so the full price reaches FMT.
                        </span>
                      </label>
                    ) : null}

                    {/* Codes: partner schools and Teacher of the Month winners
                        get one; the server decides what it unlocks. */}
                    <div className="mb-5">
                      {code ? (
                        <div className="flex items-center gap-3 bg-apple/5 ring-1 ring-apple/25 rounded-xl px-3.5 py-2.5">
                          <Ticket size={14} className="text-apple shrink-0" aria-hidden="true" />
                          <span className="flex-1 min-w-0">
                            <span className="block text-xs font-bold tracking-wide">{code.value}</span>
                            <span className="block text-xs text-chalkboard/70">{code.label}</span>
                          </span>
                          <button onClick={() => { setCode(null); setCodeState('idle'); }} aria-label="Remove code"
                            className="p-1.5 rounded-lg text-chalkboard/70 hover:text-apple transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : !codeOpen ? (
                        <button onClick={() => setCodeOpen(true)} aria-expanded={false} aria-controls="merch-code-row"
                          className="text-sm font-bold text-ruler underline underline-offset-4 decoration-ruler/30 hover:decoration-ruler">
                          Have a code?
                        </button>
                      ) : (
                        <div id="merch-code-row">
                          <label htmlFor="merch-code" className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 block">
                            Code from your school or Teacher of the Month
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="merch-code" name="code" value={codeInput} autoFocus autoComplete="off"
                              onChange={(e) => { setCodeInput(e.target.value); setCodeState('idle'); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } }}
                              aria-invalid={codeState === 'bad'}
                              aria-describedby={codeState === 'bad' ? 'merch-code-error' : undefined}
                              className="flex-1 min-w-0 bg-paper ring-1 ring-chalkboard/15 rounded-xl px-3.5 py-2.5 text-sm uppercase tracking-wide outline-none focus:ring-2 focus:ring-apple/40"
                            />
                            <button onClick={applyCode} disabled={codeState === 'checking' || !codeInput.trim()}
                              className="px-4 rounded-xl bg-chalkboard text-white font-bold text-sm transition-colors hover:bg-apple disabled:opacity-40">
                              {codeState === 'checking' ? <Loader2 size={15} className="animate-spin" aria-label="Checking" /> : 'Apply'}
                            </button>
                          </div>
                          {codeState === 'bad' && (
                            <p id="merch-code-error" className="text-xs text-apple font-bold mt-2" role="alert">
                              That code isn't working. Check it with whoever gave it to you.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <dl className="space-y-1.5 text-sm border-t border-chalkboard/10 pt-4 mb-5">
                      <div className="flex justify-between text-chalkboard/75">
                        <dt>Items</dt>
                        <dd className="tabular-nums">{formatPrice(priced.merchandise + priced.freeTeeSavings)}</dd>
                      </div>
                      {priced.freeTeeSavings > 0 && (
                        <div className="flex justify-between text-apple font-bold">
                          <dt>Free tee</dt>
                          <dd className="tabular-nums">−{formatPrice(priced.freeTeeSavings)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between text-chalkboard/75">
                        <dt>{fulfilment === 'pickup' ? 'Pickup' : 'Delivery'}</dt>
                        <dd className="tabular-nums">{priced.delivery === 0 ? 'Free' : formatPrice(priced.delivery)}</dd>
                      </div>
                      {priced.fee > 0 && (
                        <div className="flex justify-between text-chalkboard/75">
                          <dt>Card fee, covered by you</dt>
                          <dd className="tabular-nums">{formatPrice(priced.fee)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between font-serif font-bold text-xl pt-2">
                        <dt>Total</dt>
                        <dd className="tabular-nums">{formatPrice(priced.total)}</dd>
                      </div>
                    </dl>

                    {priced.total === 0 ? (
                      <a href={freeClaimHref()}
                        className="w-full bg-chalkboard text-white py-4 rounded-2xl font-bold hover:bg-apple transition-colors flex items-center justify-center gap-2">
                        Claim your free tee by email <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    ) : (
                      <button onClick={startCheckout}
                        className="w-full bg-chalkboard text-white py-4 rounded-2xl font-bold hover:bg-apple transition-colors active:scale-[0.98]">
                        Check out · {formatPrice(priced.total)}
                      </button>
                    )}

                    <p className="text-xs text-chalkboard/70 leading-relaxed mt-4">
                      {effectiveEducator
                        ? "You're paying our cost, so FMT makes nothing on this order — which is the point."
                        : IMPACT_NOTE}{' '}
                      Merch is a purchase, not a donation, so it isn't tax-deductible. Card payments by Stripe.
                    </p>
                  </>
                )}
              </div>

              <p className="text-sm text-chalkboard/70 text-center mt-5 leading-relaxed">
                Rather skip the shirt?{' '}
                <a href="/donate" onClick={(e) => { e.preventDefault(); navigate('/donate'); }} className="text-apple font-bold underline underline-offset-2">
                  Donate directly
                </a>{' '}
                — that part is tax-deductible.
              </p>
            </aside>
          </div>
        </div>
      </main>

      {/* Below the wide layout, the order sits under the products. This bar
          keeps it one tap away once something is in it. */}
      <AnimatePresence>
        {itemCount > 0 && !panelInView && !checkingOut && (
          <motion.div
            initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="xl:hidden fixed bottom-4 inset-x-4 z-[60] max-w-md mx-auto"
          >
            <button
              onClick={reviewOrder}
              className="w-full flex items-center justify-between gap-3 bg-chalkboard text-white rounded-full pl-5 pr-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.3)]"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <ShoppingBag size={15} aria-hidden="true" />
                {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatPrice(priced.total)}
              </span>
              <span className="bg-white text-chalkboard text-xs font-bold uppercase tracking-[0.14em] rounded-full px-4 py-2.5">
                Review order
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkingOut && (
          <MerchCheckout
            lines={cart}
            fulfilment={fulfilment}
            code={code?.value ?? ''}
            educator={educator}
            coverFee={coverFee}
            total={priced.total}
            onClose={() => setCheckingOut(false)}
          />
        )}
      </AnimatePresence>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
