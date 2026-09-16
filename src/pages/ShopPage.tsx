import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X, Plus, Minus, MapPin, Truck, CheckCircle2, AlertCircle, GraduationCap, Pencil, Ticket, Loader2 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { STRIPE_PUBLISHABLE_KEY } from '../lib/donate';
import { GARMENT_ART } from '../components/merchDoodles';
import { MERCH_PHOTOS } from '../data/merchPhotos';
import {
  MERCH, MERCH_COLORS, MERCH_SIZES, orderTotal, formatPrice, findProduct,
  FREE_DELIVERY_OVER, DELIVERY_FEE,
  type CartLine, type Fulfilment, type MerchSize, type MerchColor,
} from '../../shared/merch';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Per-product picker state, before the item is added to the bag. */
interface Picker { size: MerchSize; colorId: string; qty: number; }

/**
 * What a shirt actually pays for.
 *
 * This line used to compute a supply count from price minus cost — "about 8
 * spiral notebooks" — which was wrong twice over. It was only as honest as
 * the cost figures behind it, and two of those are still estimates; and it
 * counted the whole margin as though every cent reached a classroom, when
 * card fees and overhead come out of it first. It also published the margin
 * sideways, since a notebook count divides straight back into dollars.
 *
 * Naming the program the money feeds is true of every order, needs no
 * arithmetic, and cannot drift out of date when a blank price changes.
 */
const IMPACT_NOTE =
  'Shirt sales pay for supply restocks — the box that turns up when a classroom runs out of markers in February.';

function MerchCheckout({ lines, fulfilment, code, onClose }: {
  lines: CartLine[]; fulfilment: Fulfilment; code: string; onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stripePromise?.catch(() =>
      setError("Couldn't load the secure checkout. Check your connection, or any script blocker."));
  }, []);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/create-merch-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, fulfilment, code }),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      setError(data.error || 'Could not start checkout. Please try again.');
      throw new Error(data.error || 'merch session failed');
    }
    return data.clientSecret as string;
  }, [lines, fulfilment, code]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-chalkboard/8 shrink-0">
          <p className="font-serif font-bold text-lg">Checkout</p>
          <button onClick={onClose} aria-label="Close checkout" className="p-2 rounded-xl hover:bg-chalkboard/5 text-chalkboard/50 hover:text-chalkboard transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle size={22} className="text-apple mx-auto mb-3" />
              <p className="text-sm text-chalkboard/75 leading-relaxed">{error}</p>
              <a href="mailto:hello@fundingmichiganteachers.org" className="inline-block mt-4 text-sm font-bold text-apple underline">
                Order by email instead
              </a>
            </div>
          ) : stripePromise ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <p className="p-8 text-center text-sm text-chalkboard/70">
              Online payment isn't configured. Email{' '}
              <a href="mailto:hello@fundingmichiganteachers.org" className="text-apple underline">hello@fundingmichiganteachers.org</a>{' '}
              and we'll sort your order out.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * A card opens on the colorway we have a photo of, and on the first swatch
 * otherwise. Without this every card started on speckled black, so the
 * sweatshirt and hoodie opened on a drawing with the photograph one click
 * away — which sells the shirt worse than it actually looks.
 *
 * Falls through to the first swatch if a photo ever names a colorway that
 * isn't for sale, so a typo cannot leave a card unselectable.
 */
function defaultColorId(productId: string): string {
  const pictured = MERCH_PHOTOS[productId]?.colorId;
  return pictured && MERCH_COLORS.some((c) => c.id === pictured)
    ? pictured
    : MERCH_COLORS[0].id;
}

/**
 * The garment, shown as a photo where we have one of the selected colorway
 * and as the hand-drawn version otherwise.
 *
 * `failed` carries the ids whose photo file did not load. A missing photo
 * quietly becomes a drawing instead of a broken-image icon, which is what
 * makes it safe to list a photo here before the file has been committed.
 */
function Garment({ productId, color, className, imgClassName, failed, onFail }: {
  productId: string;
  color: MerchColor;
  className?: string;
  imgClassName?: string;
  failed: Record<string, boolean>;
  onFail: (id: string) => void;
}) {
  const photo = MERCH_PHOTOS[productId];
  const Art = GARMENT_ART[productId];

  if (photo && photo.colorId === color.id && !failed[productId]) {
    return (
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        onError={() => onFail(productId)}
        className={imgClassName}
      />
    );
  }

  return Art ? <Art color={color} className={className} /> : null;
}

export default function ShopPage() {
  const [pickers, setPickers] = useState<Record<string, Picker>>(() =>
    Object.fromEntries(MERCH.map((p) => [p.id, { size: 'M' as MerchSize, colorId: defaultColorId(p.id), qty: 1 }])));
  const [cart, setCart] = useState<CartLine[]>([]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>('pickup');
  const [educator, setEducator] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  // Codes are checked by the server; the page never knows what any code is,
  // only what the server says about the one that was typed.
  const [codeInput, setCodeInput] = useState('');
  const [code, setCode] = useState<{ value: string; kind: string; label: string } | null>(null);
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'bad'>('idle');
  const [photoFailed, setPhotoFailed] = useState<Record<string, boolean>>({});
  const failPhoto = (id: string) => setPhotoFailed((p) => ({ ...p, [id]: true }));
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'Shop — FMT Merch | Funding Michigan Teachers',
      description:
        'FMT t-shirts, crewnecks and hoodies, printed locally and hand-pressed by our students. Every purchase funds classroom supplies for Michigan teachers. Educator pricing available at cost.',
      path: '/shop',
    });
    if (new URLSearchParams(window.location.search).get('stripe_session_id')) {
      setConfirmed(true);
    }
  }, []);

  // Educator pricing is a property of the whole order, so applying it has to
  // rewrite the lines already in the bag, not just the ones added afterwards.
  const lines = useMemo(() => cart.map((l) => ({ ...l, atCost: educator })), [cart, educator]);
  const { subtotal, delivery, total } = orderTotal(lines, fulfilment);

  const setPicker = (id: string, patch: Partial<Picker>) =>
    setPickers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const addToBag = (productId: string) => {
    const pick = pickers[productId];
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === productId && l.size === pick.size && l.colorId === pick.colorId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(10, next[i].qty + pick.qty) };
        return next;
      }
      return [...prev, { productId, size: pick.size, colorId: pick.colorId, qty: pick.qty }];
    });
  };

  const removeLine = (i: number) => setCart((prev) => prev.filter((_, idx) => idx !== i));

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
      const data = await res.json();
      if (data.valid) {
        setCode({ value: entered.toUpperCase(), kind: data.kind, label: data.label });
        if (data.kind === 'educator') setEducator(true);
        setCodeState('idle');
        setCodeInput('');
      } else {
        setCodeState('bad');
      }
    } catch {
      setCodeState('bad');
    }
  };

  const clearCode = () => {
    setCode(null);
    setCodeState('idle');
    setEducator(false);
  };

  if (confirmed) {
    return (
      <div className="min-h-[100dvh] bg-paper flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="font-serif font-bold text-3xl mb-3">Order in.</h1>
            <p className="text-chalkboard/70 font-light leading-relaxed mb-7">
              Thank you — a receipt is on its way to your inbox. We press every order by hand, so
              give us a few days; we'll email you when yours is ready and sort out pickup or delivery.
            </p>
            <button onClick={() => navigate('/shop')} className="bg-chalkboard text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-apple transition-colors">
              Back to the shop
            </button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main className="relative z-10 flex-1">
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-10">
          <div className="pointer-events-none absolute top-0 left-0 w-[560px] h-[560px] bg-pencil/[0.08] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/4" />
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-3xl mx-auto relative"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/50 mb-5">
              Printed locally · Pressed by students
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-6 text-balance">
              Wear it. <span className="text-apple italic font-normal">Fund it.</span>
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed">
              Swift Prints makes our film here in town, and our students heat-press every shirt one
              at a time. What's left after materials buys pencils, markers and tissues for classrooms
              that ran out.
            </p>
          </motion.div>
        </section>

        {/* Products */}
        <section className="px-4 sm:px-6 pb-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
            {MERCH.map((product, i) => {
              const pick = pickers[product.id];
              const color = MERCH_COLORS.find((c) => c.id === pick.colorId)!;
              const price = educator ? product.cost : product.price;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                  className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/8 p-5 flex flex-col"
                >
                  {/* Portrait box: the photos are full-length shots, and a
                      short landscape crop of one cuts the artwork in half. */}
                  <div className="bg-paper rounded-2xl mb-4 aspect-[4/5] overflow-hidden">
                    <Garment
                      productId={product.id}
                      color={color}
                      className="w-full h-full p-3"
                      imgClassName="w-full h-full object-cover"
                      failed={photoFailed}
                      onFail={failPhoto}
                    />
                  </div>

                  <h2 className="font-serif font-bold text-lg leading-snug">{product.name}</h2>
                  <p className="text-sm text-chalkboard/60 font-light mt-1 mb-3 leading-snug">{product.blurb}</p>

                  <p className="font-serif font-bold text-2xl mb-4">
                    {formatPrice(price)}
                    {educator && (
                      <span className="ml-2 text-xs font-sans font-bold uppercase tracking-wider text-apple align-middle">
                        at cost
                      </span>
                    )}
                  </p>

                  {/* Color */}
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2">
                    Color — {color.name}
                  </p>
                  <div className="flex gap-2 mb-4">
                    {MERCH_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPicker(product.id, { colorId: c.id })}
                        aria-label={c.name}
                        aria-pressed={c.id === pick.colorId}
                        className={`w-8 h-8 rounded-full ring-2 transition-all ${
                          c.id === pick.colorId ? 'ring-apple scale-110' : 'ring-chalkboard/15 hover:ring-chalkboard/35'
                        }`}
                        style={{
                          background: c.speckle
                            ? `radial-gradient(circle at 30% 30%, #5a5a5e 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, #5a5a5e 1px, transparent 1.5px), ${c.hex}`
                            : c.hex,
                        }}
                      />
                    ))}
                  </div>

                  {/* Size */}
                  <label htmlFor={`size-${product.id}`} className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 block">
                    Size
                  </label>
                  <div className="flex gap-1.5 mb-4" id={`size-${product.id}`}>
                    {MERCH_SIZES.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setPicker(product.id, { size: sz })}
                        aria-pressed={sz === pick.size}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          sz === pick.size
                            ? 'bg-chalkboard text-white'
                            : 'bg-paper text-chalkboard/70 hover:bg-chalkboard/10'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {/* Quantity + add */}
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex items-center gap-1 bg-paper rounded-xl p-1">
                      <button onClick={() => setPicker(product.id, { qty: Math.max(1, pick.qty - 1) })}
                        aria-label="One fewer" className="w-7 h-7 rounded-lg hover:bg-chalkboard/10 flex items-center justify-center">
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">{pick.qty}</span>
                      <button onClick={() => setPicker(product.id, { qty: Math.min(10, pick.qty + 1) })}
                        aria-label="One more" className="w-7 h-7 rounded-lg hover:bg-chalkboard/10 flex items-center justify-center">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => addToBag(product.id)}
                      className="flex-1 bg-apple text-white py-2.5 rounded-xl font-bold text-sm hover:bg-apple/90 active:scale-[0.98] transition-all"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* The order slip.

            This was a plain white box with a bulleted list in it — the least
            designed thing on a site that otherwise has a voice. It is now the
            paper artifact the rest of the site is built around: a supply order
            slip, torn along the top, ruled like a notebook, with the garment
            drawn on each line and a hand-written note saying what the order
            actually buys a classroom. */}
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white rounded-[1.5rem] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)] ring-1 ring-chalkboard/8 overflow-hidden">
              {/* torn top edge */}
              <div
                className="h-3 w-full"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #fcfaf5 0 7px, transparent 7px 14px)',
                  boxShadow: 'inset 0 -1px 0 rgba(26,28,29,0.08)',
                }}
                aria-hidden="true"
              />

              <div className="p-6 sm:p-8">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-hand text-3xl text-chalkboard -rotate-1">Your order</h2>
                  <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/40">
                    FMT · Okemos
                  </span>
                </div>
                <div className="h-px bg-chalkboard/15 mb-5" />

                <p className="text-xs text-chalkboard/55 font-light leading-relaxed mb-6">
                  Merch is a purchase, not a donation —{' '}
                  <strong className="text-chalkboard/75 font-semibold">it isn't tax-deductible</strong>.
                  What's left after materials goes to classrooms.
                </p>

                {cart.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="font-hand text-2xl text-chalkboard/30 -rotate-1 mb-1">nothing here yet</p>
                    <p className="text-sm text-chalkboard/50 font-light">
                      Pick a size and color above.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ruled lines, like the pad this would be written on */}
                    <ul className="mb-7">
                      {lines.map((l, i) => {
                        const prod = findProduct(l.productId)!;
                        const col = MERCH_COLORS.find((x) => x.id === l.colorId)!;
                        return (
                          <li
                            key={`${l.productId}-${l.size}-${l.colorId}`}
                            className="flex items-center gap-4 py-3 border-b border-dashed border-chalkboard/15"
                          >
                            <span className="w-11 h-11 shrink-0 bg-paper rounded-xl overflow-hidden block">
                              <Garment
                                productId={l.productId}
                                color={col}
                                className="w-full h-full p-1"
                                imgClassName="w-full h-full object-cover"
                                failed={photoFailed}
                                onFail={failPhoto}
                              />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-bold leading-snug truncate">{prod.name}</span>
                              <span className="block text-xs text-chalkboard/55">
                                {col.name} · {l.size} · ×{l.qty}
                              </span>
                            </span>
                            <span className="text-sm font-bold tabular-nums">
                              {formatPrice((educator ? prod.cost : prod.price) * l.qty)}
                            </span>
                            <button
                              onClick={() => removeLine(i)}
                              aria-label={`Remove ${prod.name}`}
                              className="p-1.5 rounded-lg text-chalkboard/30 hover:text-apple hover:bg-apple/5 transition-colors shrink-0"
                            >
                              <X size={15} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/70 mb-2.5">
                      How would you like it?
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2.5 mb-7">
                      {([
                        { id: 'pickup' as const, icon: MapPin, title: 'Pickup — free',
                          body: 'We drop off at your school, or catch us at a popup event.' },
                        { id: 'delivery' as const, icon: Truck,
                          title: `Delivery — ${formatPrice(DELIVERY_FEE)}`,
                          body: `Free on orders over ${formatPrice(FREE_DELIVERY_OVER)}.` },
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setFulfilment(opt.id)}
                          aria-pressed={fulfilment === opt.id}
                          className={`text-left p-4 rounded-2xl ring-1 transition-all ${
                            fulfilment === opt.id
                              ? 'ring-apple bg-apple/5 shadow-[0_4px_14px_rgba(192,57,43,0.08)]'
                              : 'ring-chalkboard/10 hover:ring-chalkboard/30'
                          }`}
                        >
                          <span className="flex items-center gap-2 font-bold text-sm mb-1">
                            <opt.icon size={14} className="text-apple" />
                            {opt.title}
                          </span>
                          <span className="block text-xs text-chalkboard/60 font-light leading-snug">
                            {opt.body}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Educator pricing.

                        This began as a large card at the top of the page that
                        spelled out what a garment costs us — "a tee is $14
                        instead of $25" — which published FMT's margin to every
                        visitor before they had even picked a size. The option
                        is worth keeping; broadcasting the numbers is not. It
                        now sits quietly with the other order options and says
                        nothing about what we make on a shirt. */}
                    <label className="flex items-start gap-3 mb-7 cursor-pointer group">
                      <input
                        type="checkbox" id="educator-pricing" name="educator"
                        checked={educator} onChange={(e) => setEducator(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#c0392b] shrink-0"
                      />
                      <span className="flex items-start gap-2 text-sm text-chalkboard/70 font-light leading-snug group-hover:text-chalkboard transition-colors">
                        <GraduationCap size={15} className="text-apple shrink-0 mt-0.5" />
                        <span>
                          I'm a teacher or school staff member —{' '}
                          <strong className="font-semibold text-chalkboard">educator pricing</strong>
                        </span>
                      </span>
                    </label>

                    {/* Code entry. Partner schools and Teacher of the Month
                        winners get one; the server decides what it unlocks. */}
                    <div className="mb-6">
                      {code ? (
                        <div className="flex items-center gap-3 bg-apple/5 ring-1 ring-apple/25 rounded-2xl px-4 py-3">
                          <Ticket size={15} className="text-apple shrink-0" />
                          <span className="flex-1 min-w-0">
                            <span className="block text-xs font-bold tracking-wide">{code.value}</span>
                            <span className="block text-xs text-chalkboard/60 font-light">{code.label}</span>
                          </span>
                          <button onClick={clearCode} aria-label="Remove code"
                            className="p-1.5 rounded-lg text-chalkboard/35 hover:text-apple transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <label htmlFor="merch-code" className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/70 mb-2 block">
                            Have a code?
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="merch-code" name="code" value={codeInput}
                              onChange={(e) => { setCodeInput(e.target.value); setCodeState('idle'); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } }}
                              placeholder="From your school or Teacher of the Month"
                              className="flex-1 min-w-0 bg-paper border border-chalkboard/10 rounded-xl px-4 py-2.5 text-sm uppercase tracking-wide outline-none focus:ring-4 focus:ring-apple/10 focus:border-apple/40 transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-chalkboard/35"
                            />
                            <button onClick={applyCode} disabled={codeState === 'checking' || !codeInput.trim()}
                              className="px-5 rounded-xl bg-chalkboard/8 hover:bg-chalkboard/15 font-bold text-sm transition-colors disabled:opacity-40">
                              {codeState === 'checking' ? <Loader2 size={15} className="animate-spin" /> : 'Apply'}
                            </button>
                          </div>
                          {codeState === 'bad' && (
                            <p className="text-xs text-apple font-bold mt-2">
                              That code isn't working. Check it with whoever gave it to you.
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-2 text-sm mb-6">
                      <div className="flex justify-between text-chalkboard/65">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-chalkboard/65">
                        <span>{fulfilment === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                        <span className="tabular-nums">
                          {delivery === 0 ? 'Free' : formatPrice(delivery)}
                        </span>
                      </div>
                      <div className="h-px bg-chalkboard/20 !mt-3" />
                      <div className="flex justify-between font-serif font-bold text-xl !mt-3">
                        <span>Total</span>
                        <span className="tabular-nums">{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* What the order actually does — the reason this isn't
                        just a store. See IMPACT_NOTE for why it names a
                        program instead of counting supplies. */}
                    <div className="bg-paper rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
                      <Pencil size={15} className="text-apple shrink-0 mt-1" strokeWidth={1.8} />
                      <p className="font-hand text-lg text-chalkboard/80 leading-snug">
                        {educator
                          ? "You're paying our cost, so none of this goes to FMT — which is the whole point."
                          : IMPACT_NOTE}
                      </p>
                    </div>

                    <button
                      onClick={() => setCheckingOut(true)}
                      className="w-full bg-chalkboard text-white py-4 rounded-2xl font-bold hover:bg-apple transition-colors active:scale-[0.98]"
                    >
                      Check out — {formatPrice(total)}
                    </button>
                    <p className="text-xs text-chalkboard/50 font-light text-center mt-3">
                      Secure card payment through Stripe.
                    </p>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-chalkboard/60 font-light text-center mt-6 leading-relaxed">
              Want to support us without the shirt?{' '}
              <button onClick={() => navigate('/donate')} className="text-apple font-bold underline">
                Donate directly
              </button>{' '}
              — that part is tax-deductible.
            </p>
          </div>
        </section>

      </main>

      <AnimatePresence>
        {checkingOut && (
          <MerchCheckout lines={lines} fulfilment={fulfilment} code={code?.value ?? ''} onClose={() => setCheckingOut(false)} />
        )}
      </AnimatePresence>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
