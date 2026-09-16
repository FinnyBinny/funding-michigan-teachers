import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { ShoppingBag, X, Plus, Minus, MapPin, Truck, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { STRIPE_PUBLISHABLE_KEY } from '../lib/donate';
import { GARMENT_ART } from '../components/merchDoodles';
import {
  MERCH, MERCH_COLORS, MERCH_SIZES, orderTotal, formatPrice, findProduct,
  FREE_DELIVERY_OVER, DELIVERY_FEE,
  type CartLine, type Fulfilment, type MerchSize,
} from '../../shared/merch';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Per-product picker state, before the item is added to the bag. */
interface Picker { size: MerchSize; colorId: string; qty: number; }

function MerchCheckout({ lines, fulfilment, onClose }: {
  lines: CartLine[]; fulfilment: Fulfilment; onClose: () => void;
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
      body: JSON.stringify({ lines, fulfilment }),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      setError(data.error || 'Could not start checkout. Please try again.');
      throw new Error(data.error || 'merch session failed');
    }
    return data.clientSecret as string;
  }, [lines, fulfilment]);

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

export default function ShopPage() {
  const [pickers, setPickers] = useState<Record<string, Picker>>(() =>
    Object.fromEntries(MERCH.map((p) => [p.id, { size: 'M' as MerchSize, colorId: MERCH_COLORS[0].id, qty: 1 }])));
  const [cart, setCart] = useState<CartLine[]>([]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>('pickup');
  const [educator, setEducator] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
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

        {/* Educator pricing — the reason a teacher should read this page */}
        <section className="px-4 sm:px-6 pb-10">
          <div className="max-w-3xl mx-auto">
            <label className="flex items-start gap-4 bg-white ring-1 ring-chalkboard/10 hover:ring-apple/30 rounded-[1.5rem] p-5 cursor-pointer transition-all">
              <input
                type="checkbox" id="educator-pricing" name="educator"
                checked={educator} onChange={(e) => setEducator(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#c0392b] shrink-0"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-bold text-sm mb-1">
                  <GraduationCap size={16} className="text-apple" />
                  I'm a teacher or school staff member
                </span>
                <span className="block text-sm text-chalkboard/65 font-light leading-relaxed">
                  You pay what the shirt costs us to make — no margin, nothing toward FMT. A tee is{' '}
                  <strong className="text-chalkboard">{formatPrice(findProduct('tee')!.cost)}</strong>{' '}
                  instead of {formatPrice(findProduct('tee')!.price)}. We're not going to profit from
                  the people we exist to support.
                </span>
              </span>
            </label>
          </div>
        </section>

        {/* Products */}
        <section className="px-4 sm:px-6 pb-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
            {MERCH.map((product, i) => {
              const pick = pickers[product.id];
              const color = MERCH_COLORS.find((c) => c.id === pick.colorId)!;
              const Art = GARMENT_ART[product.id];
              const price = educator ? product.cost : product.price;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                  className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/8 p-5 flex flex-col"
                >
                  <div className="bg-paper rounded-2xl mb-4 p-3">
                    {Art && <Art color={color} className="w-full h-44" />}
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

        {/* Bag */}
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/8 p-6 sm:p-7">
              <h2 className="font-serif font-bold text-xl mb-5 flex items-center gap-2">
                <ShoppingBag size={18} className="text-apple" />
                Your order
              </h2>

              <p className="text-xs text-chalkboard/55 font-light leading-relaxed bg-paper rounded-xl px-4 py-3 mb-5">
                Merch is a purchase, not a donation — <strong className="text-chalkboard/75">it isn't
                tax-deductible</strong>. What's left after materials goes to classrooms.
              </p>

              {cart.length === 0 ? (
                <p className="text-sm text-chalkboard/55 font-light py-6 text-center">
                  Nothing in your order yet — pick a size and color above.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-chalkboard/8 mb-5">
                    {lines.map((l, i) => {
                      const p = findProduct(l.productId)!;
                      const c = MERCH_COLORS.find((x) => x.id === l.colorId)!;
                      return (
                        <li key={`${l.productId}-${l.size}-${l.colorId}`} className="py-3 flex items-center gap-3">
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold truncate">{p.name}</span>
                            <span className="block text-xs text-chalkboard/55">
                              {c.name} · {l.size} · ×{l.qty}
                            </span>
                          </span>
                          <span className="text-sm font-bold tabular-nums">
                            {formatPrice((educator ? p.cost : p.price) * l.qty)}
                          </span>
                          <button onClick={() => removeLine(i)} aria-label={`Remove ${p.name}`}
                            className="p-1.5 rounded-lg text-chalkboard/35 hover:text-apple hover:bg-apple/5 transition-colors">
                            <X size={15} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Fulfilment */}
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2">
                    How would you like it?
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 mb-5">
                    <button
                      onClick={() => setFulfilment('pickup')}
                      aria-pressed={fulfilment === 'pickup'}
                      className={`text-left p-4 rounded-2xl ring-1 transition-all ${
                        fulfilment === 'pickup' ? 'ring-apple bg-apple/5' : 'ring-chalkboard/10 hover:ring-chalkboard/25'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold text-sm mb-1">
                        <MapPin size={14} className="text-apple" /> Pickup — free
                      </span>
                      <span className="block text-xs text-chalkboard/60 font-light leading-snug">
                        We drop off at your school, or catch us at a popup event.
                      </span>
                    </button>
                    <button
                      onClick={() => setFulfilment('delivery')}
                      aria-pressed={fulfilment === 'delivery'}
                      className={`text-left p-4 rounded-2xl ring-1 transition-all ${
                        fulfilment === 'delivery' ? 'ring-apple bg-apple/5' : 'ring-chalkboard/10 hover:ring-chalkboard/25'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold text-sm mb-1">
                        <Truck size={14} className="text-apple" />
                        Delivery — {formatPrice(DELIVERY_FEE)}
                      </span>
                      <span className="block text-xs text-chalkboard/60 font-light leading-snug">
                        Free on orders over {formatPrice(FREE_DELIVERY_OVER)}.
                      </span>
                    </button>
                  </div>

                  {/* Totals */}
                  <div className="space-y-1.5 text-sm border-t border-chalkboard/8 pt-4 mb-5">
                    <div className="flex justify-between text-chalkboard/65">
                      <span>Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-chalkboard/65">
                      <span>{fulfilment === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                      <span className="tabular-nums">{delivery === 0 ? 'Free' : formatPrice(delivery)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1.5">
                      <span>Total</span><span className="tabular-nums">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckingOut(true)}
                    className="w-full bg-chalkboard text-white py-3.5 rounded-xl font-bold hover:bg-apple transition-colors active:scale-[0.98]"
                  >
                    Check out — {formatPrice(total)}
                  </button>
                  <p className="text-xs text-chalkboard/50 font-light text-center mt-3 leading-relaxed">
                    Secure card payment through Stripe.
                  </p>
                </>
              )}
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
          <MerchCheckout lines={lines} fulfilment={fulfilment} onClose={() => setCheckingOut(false)} />
        )}
      </AnimatePresence>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
