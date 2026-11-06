import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import {
  X, Plus, Minus, CheckCircle2, AlertCircle, Loader2, ShoppingBasket, Check, Shield, ArrowRight,
  Footprints, ListChecks, Store, School, Sparkles, Circle, CircleCheck,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import MallMap from '../components/refill/MallMap';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { track } from '../lib/analytics';
import { useModalDialog } from '../lib/useModalDialog';
import { takeCheckoutSessionId, countConversionOnce } from '../lib/checkoutReturn';
import { getStripe } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { navigate, navLinkProps } from '../lib/navigate';
import { SCHOOLS, findSchool } from '../../shared/schools';
import {
  REFILL_SHOPS, REFILL_LISTS, findRefillItem, findRefillShop, findRefillList, itemsInShop,
  priceRefillOrder, normalizeRefillLines, missingFromList, formatRefillPrice, MAX_QTY,
  type RefillLine, type RefillList, type RefillShop, type RefillItem,
} from '../../shared/refill';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const ORDER_EMAIL = 'hello@fundingmichiganteachers.org';
const BASKET_KEY = 'fmt:refill-basket';
const DELIVERY = 'the week of January 12th';

/** "Cover the card fee" starts ticked, as on /donate and /shop. */
const COVER_FEE_DEFAULT = true;

/**
 * The Mid-Year Refill store.
 *
 * Classroom supply budgets run out by winter. This page lets a supporter buy
 * the January restock the way they would shop for their own house: walk a
 * street of supply shops, fill a list, check out. FMT then buys exactly what
 * was paid for and delivers it the week of January 12th.
 *
 * Two front doors, because not everyone wants the walk:
 *   - "Walk the shops": Main Street (MallMap), a list to fill, a basket.
 *   - "Pick a wish list": plain cards — a teacher's list from the database,
 *     or one of FMT's bundles — and a single "fund this" button.
 * Both end in the same basket and the same Stripe checkout.
 *
 * Money: the browser sends item ids and quantities to the Worker, which
 * prices them from shared/refill.ts. Nothing here decides an amount.
 */

/** A teacher's list from the refill_wishlists table. */
interface Wishlist {
  id: number;
  label: string;
  school: string;
  note: string | null;
  items: RefillLine[];
  active: boolean;
  display_order: number;
}

/** What the shopper set out to fill: one of FMT's bundles, or a teacher's list. */
type Goal = { kind: 'bundle'; list: RefillList } | { kind: 'wishlist'; list: Wishlist } | null;

function goalItems(goal: Goal): readonly RefillLine[] {
  return goal ? goal.list.items : [];
}

function goalName(goal: Goal): string {
  if (!goal) return '';
  return goal.kind === 'bundle' ? goal.list.name : goal.list.label;
}

/** The registry school a wish list's school name points at, if any. */
function schoolSlugFor(name: string): string | null {
  const t = name.trim().toLowerCase();
  const s = SCHOOLS.find((x) => x.name.toLowerCase() === t || x.shortName.toLowerCase() === t || t.includes(x.shortName.toLowerCase()));
  return s?.slug ?? null;
}

function loadBasket(): RefillLine[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(BASKET_KEY) ?? '[]');
    return Array.isArray(saved) ? normalizeRefillLines(saved) : [];
  } catch {
    return [];
  }
}

// ── Checkout dialog ─────────────────────────────────────────────────────────

function RefillCheckout({ lines, coverFee, designation, goal, total, onClose }: {
  lines: RefillLine[]; coverFee: boolean; designation: string; goal: Goal; total: number; onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const stripePromise = useMemo(() => getStripe(), []);

  useEffect(() => {
    stripePromise?.catch(() =>
      setError("Couldn't load the secure checkout. Check your connection, or any script blocker."));
  }, []);

  const dialogRef = useRef<HTMLDivElement>(null);
  useModalDialog(dialogRef, onClose);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/create-refill-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Item ids and quantities, a school, and a yes/no. Never a price.
      body: JSON.stringify({
        lines,
        coverFee,
        designation,
        listId: goal?.kind === 'bundle' ? goal.list.id : undefined,
        wishlist: goal?.kind === 'wishlist' ? { id: goal.list.id, label: `${goal.list.label}, ${goal.list.school}` } : undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { clientSecret?: string; error?: string };
    if (!res.ok || !data.clientSecret) {
      setError(data.error || 'Could not start checkout. Please try again.');
      throw new Error(data.error || 'refill session failed');
    }
    return data.clientSecret;
  }, [lines, coverFee, designation, goal]);

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
        aria-labelledby="refill-checkout-title"
        className="bg-white rounded-[2rem] w-full max-w-lg max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="bg-chalkboard px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p id="refill-checkout-title" className="text-white font-bold text-sm">Give {formatRefillPrice(total)}</p>
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
                Email us instead
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
              and we'll sort it out.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

// ── A shop, opened ──────────────────────────────────────────────────────────

function ShopSheet({ shop, basket, wanted, onChange, onClose }: {
  shop: RefillShop;
  basket: RefillLine[];
  /** Quantity the shopper's list still wants of each item here. */
  wanted: Map<string, number>;
  onChange: (itemId: string, qty: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalDialog(dialogRef, onClose);
  const items = itemsInShop(shop.id);
  const qtyOf = (id: string) => basket.find((l) => l.itemId === id)?.qty ?? 0;
  const trim = `hsl(${shop.hue} 45% 38%)`;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.45, ease: EASE }}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-title"
        className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-xl max-h-[88dvh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="px-6 py-5 flex items-start justify-between gap-4 shrink-0" style={{ background: `hsl(${shop.hue} 55% 92%)` }}>
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.2em] font-bold" style={{ color: trim }}>You're inside</p>
            <h2 id="shop-title" className="font-hand text-2xl leading-tight text-chalkboard">{shop.name}</h2>
            <p className="text-sm text-chalkboard/70 mt-0.5">{shop.tagline}</p>
          </div>
          <button onClick={onClose} aria-label="Leave the shop" className="p-2 rounded-xl hover:bg-black/5 text-chalkboard/70 hover:text-chalkboard transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        <ul className="overflow-y-auto divide-y divide-chalkboard/10 px-2">
          {items.map((item) => {
            const qty = qtyOf(item.id);
            const want = wanted.get(item.id) ?? 0;
            const satisfied = want > 0 && qty >= want;
            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-snug flex items-center gap-2 flex-wrap">
                    {item.name}
                    {want > 0 && (
                      <span className={`text-[0.5625rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full ${satisfied ? 'bg-apple/10 text-apple' : 'bg-pencil/30 text-pencil-dark'}`}>
                        {satisfied ? 'On your list ✓' : `Your list needs ${want}`}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-chalkboard/70 mt-0.5">{item.pack} · {formatRefillPrice(item.price)}</p>
                </div>
                {qty === 0 ? (
                  <button
                    onClick={() => onChange(item.id, want || 1)}
                    className="shrink-0 bg-chalkboard text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-apple transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={13} strokeWidth={2.5} aria-hidden="true" /> Add{want > 1 ? ` ${want}` : ''}
                  </button>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-0.5 bg-paper rounded-lg p-0.5">
                    <button onClick={() => onChange(item.id, qty - 1)} aria-label={`One fewer ${item.name}`} className="w-9 h-9 rounded-md hover:bg-chalkboard/10 flex items-center justify-center">
                      <Minus size={12} aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums" aria-label={`Quantity ${qty}`}>{qty}</span>
                    <button onClick={() => onChange(item.id, qty + 1)} disabled={qty >= MAX_QTY} aria-label={`One more ${item.name}`} className="w-9 h-9 rounded-md hover:bg-chalkboard/10 flex items-center justify-center disabled:opacity-30">
                      <Plus size={12} aria-hidden="true" />
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-6 py-4 border-t border-chalkboard/10 shrink-0 flex items-center justify-between gap-3">
          <p className="text-xs text-chalkboard/70">Prices are what the pack costs us; we buy and deliver it.</p>
          <button onClick={onClose} className="bg-paper text-chalkboard text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-chalkboard/10 transition-colors">
            Back to the street
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

type Confirmation = null | 'checking' | 'confirmed' | 'failed';
type View = 'entrance' | 'street' | 'lists';

export default function RefillPage() {
  const [view, setView] = useState<View>('entrance');
  const [goal, setGoal] = useState<Goal>(null);
  const [basket, setBasket] = useState<RefillLine[]>(loadBasket);
  const [openShop, setOpenShop] = useState<RefillShop | null>(null);
  const [designation, setDesignation] = useState('general');
  const [coverFee, setCoverFee] = useState(COVER_FEE_DEFAULT);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [announce, setAnnounce] = useState('');
  const [panelInView, setPanelInView] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const streetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { sessionStorage.setItem(BASKET_KEY, JSON.stringify(basket)); } catch { /* storage blocked */ }
  }, [basket]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/refill'));

    const sessionId = takeCheckoutSessionId();
    if (sessionId) {
      setConfirmation('checking');
      fetch(`/api/checkout-session-status?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data: { status?: string; paymentStatus?: string; amountTotal?: number; giftCents?: number | null; designationLabel?: string | null }) => {
          const ok = data.status === 'complete' || data.paymentStatus === 'paid';
          setConfirmation(ok ? 'confirmed' : 'failed');
          setConfirmedLabel(data.designationLabel ?? null);
          if (ok) {
            try { sessionStorage.removeItem(BASKET_KEY); } catch { /* nothing saved */ }
            setBasket([]);
          }
          if (ok && countConversionOnce(sessionId)) {
            track('refill_purchase_completed', {
              value: data.giftCents ? data.giftCents / 100 : data.amountTotal ? data.amountTotal / 100 : undefined,
              currency: 'USD',
              transaction_id: sessionId,
            });
          }
        })
        .catch(() => setConfirmation('failed'));
      return;
    }

    // /refill?school=okemos from a school page; ?view=lists skips the
    // entrance; ?list=tissue-run opens the street with that list chosen.
    const params = new URLSearchParams(window.location.search);
    const school = params.get('school');
    if (school && findSchool(school)) setDesignation(`school:${school}`);
    const listId = params.get('list');
    const bundle = listId ? findRefillList(listId) : undefined;
    if (bundle) { setGoal({ kind: 'bundle', list: bundle }); setView('street'); }
    else if (params.get('view') === 'lists') setView('lists');
    else if (params.get('view') === 'street') setView('street');
  }, []);

  // Teacher wish lists, when the database is reachable. The page works
  // without them: FMT's own bundles are in the code.
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('refill_wishlists')
      .select('*')
      .eq('active', true)
      .order('display_order')
      .order('id')
      .then(({ data }) => {
        if (!data) return;
        setWishlists(data.map((r) => ({
          id: Number(r.id),
          label: String(r.label ?? ''),
          school: String(r.school ?? ''),
          note: r.note ? String(r.note) : null,
          items: normalizeRefillLines(Array.isArray(r.items) ? r.items : []),
          active: r.active !== false,
          display_order: Number(r.display_order ?? 0),
        })).filter((w) => w.items.length > 0));
      });
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPanelInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [view, confirmation]);

  const priced = priceRefillOrder(basket, { coverFee });
  const feeIfCovered = priceRefillOrder(basket, { coverFee: true }).fee;
  const packs = priced.packs;

  const missing = useMemo(() => (goal ? missingFromList({ id: '', name: '', forWhom: '', blurb: '', items: goalItems(goal) }, basket) : []), [goal, basket]);
  /** What the list asks for in total, so a shop can show "on your list ✓" once it is met. */
  const wanted = useMemo(() => new Map(goalItems(goal).map((l) => [l.itemId, l.qty])), [goal]);
  const neededShops = useMemo(() => new Set(missing.map((l) => findRefillItem(l.itemId)?.shop ?? '')), [missing]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of basket) {
      const shop = findRefillItem(l.itemId)?.shop;
      if (shop) c[shop] = (c[shop] ?? 0) + l.qty;
    }
    return c;
  }, [basket]);
  const listComplete = goal !== null && missing.length === 0 && goalItems(goal).length > 0;

  const setQty = (itemId: string, qty: number) => {
    const item = findRefillItem(itemId);
    if (!item) return;
    setBasket((prev) => {
      const next = prev.filter((l) => l.itemId !== itemId);
      if (qty >= 1) next.push({ itemId, qty: Math.min(MAX_QTY, qty) });
      return next;
    });
    const before = basket.find((l) => l.itemId === itemId)?.qty ?? 0;
    if (qty > before) {
      setAnnounce(`Added ${item.name} to your basket.`);
      track('refill_added_to_basket', { item: itemId });
    }
  };

  const chooseGoal = (g: Goal) => {
    setGoal(g);
    if (g) track('refill_list_chosen', { list: g.kind === 'bundle' ? g.list.id : `wishlist:${g.list.id}` });
  };

  /** "Fund this list": the whole list into the basket, then straight to the basket. */
  const fundList = (g: Exclude<Goal, null>) => {
    chooseGoal(g);
    setBasket((prev) => {
      const have = new Map(prev.map((l) => [l.itemId, l.qty]));
      for (const l of g.list.items) have.set(l.itemId, Math.max(have.get(l.itemId) ?? 0, l.qty));
      return [...have].map(([itemId, qty]) => ({ itemId, qty }));
    });
    if (g.kind === 'wishlist') {
      const slug = schoolSlugFor(g.list.school);
      if (slug) setDesignation(`school:${slug}`);
    }
    setAnnounce(`${goalName(g)} is in your basket.`);
    window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      headingRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  const enterShop = useCallback((shopId: string) => {
    const shop = findRefillShop(shopId);
    if (shop) {
      setOpenShop(shop);
      track('refill_shop_entered', { shop: shopId });
    }
  }, []);

  const startCheckout = () => {
    track('refill_checkout_started', { value: priced.total / 100 });
    setCheckingOut(true);
  };

  const reviewBasket = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    headingRef.current?.focus({ preventScroll: true });
  };

  const go = (v: View) => {
    setView(v);
    track('refill_view', { view: v });
    window.setTimeout(() => streetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  // ── Back from Stripe ──
  if (confirmation) {
    return (
      <div className="min-h-[100dvh] bg-paper flex flex-col">
        <SiteHeader />
        <main id="main" className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md text-center" role="status">
            {confirmation === 'checking' && (
              <>
                <Loader2 className="animate-spin text-apple mx-auto mb-5" size={30} aria-hidden="true" />
                <p className="text-chalkboard/70">Confirming your gift…</p>
              </>
            )}
            {confirmation === 'confirmed' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>
                <h1 className="font-serif font-bold text-3xl mb-3">Basket's full. Thank you.</h1>
                <p className="text-chalkboard/75 font-light leading-relaxed mb-7">
                  Your items are on our purchase list{confirmedLabel ? ` for the ${confirmedLabel}` : ''}. We order
                  them, box them up, and deliver them to classrooms {DELIVERY}. A receipt is on its way to your
                  inbox, and we'll email you again when the boxes land.
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
                  We couldn't verify this payment. If you were charged, your Stripe receipt is your proof and
                  we'll honour it — email {ORDER_EMAIL} and we'll sort it out.
                </p>
              </>
            )}
            {confirmation !== 'checking' && (
              <button onClick={() => { setConfirmation(null); navigate('/refill'); }} className="bg-chalkboard text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-apple transition-colors">
                Back to the store
              </button>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const schoolLabel = designation.startsWith('school:') ? findSchool(designation.slice(7))?.shortName ?? null : null;

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>

      <main id="main" className="relative z-10 flex-1 px-4 sm:px-6 pt-28 sm:pt-36 pb-28 xl:pb-20">
        <div className="pointer-events-none absolute top-0 right-0 w-[560px] h-[560px] bg-ruler/[0.07] rounded-full blur-[140px] translate-x-1/3 -translate-y-1/4" />

        <div className="max-w-7xl mx-auto relative">
          <motion.header
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-2xl mb-10 sm:mb-12"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-4">
              Mid-Year Refill · Delivered {DELIVERY}
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.03] tracking-[-0.02em] mb-4 text-balance">
              Shop for a classroom <span className="text-apple italic font-normal">that ran out.</span>
            </h1>
            <p className="text-lg text-chalkboard/75 font-light leading-relaxed">
              Most classroom supply budgets are gone by December, with half a school year to go. Walk our
              street of supply shops, fill a list, and check out. We buy exactly what you picked and carry it
              into classrooms {DELIVERY}.
            </p>
            <p className="text-sm text-chalkboard/70 mt-3">
              A refill order is a donation to FMT, a 501(c)(3), spent on the supplies in your basket.
            </p>
          </motion.header>

          {/* ── Entrance: two doors ── */}
          {view === 'entrance' && (
            <section aria-labelledby="entrance-heading" className="mb-12">
              <h2 id="entrance-heading" className="sr-only">Two ways to shop</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <DoorCard
                  icon={Footprints}
                  eyebrow="The full experience"
                  title="Walk the shops"
                  body="Seven little stores on one street. Pick a list, find every item on it, and check out at the end."
                  cta="Start walking"
                  onClick={() => go('street')}
                  primary
                />
                <DoorCard
                  icon={ListChecks}
                  eyebrow="The quick way"
                  title="Pick a wish list"
                  body="Skip the walk. Choose a teacher's wish list or one of our ready-made bundles and fund it in one go."
                  cta="See the lists"
                  onClick={() => go('lists')}
                />
              </div>
            </section>
          )}

          <div ref={streetRef} className="scroll-mt-28" />

          {view !== 'entrance' && (
            <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
              <div className="min-w-0">
                {/* Switch between the two ways in */}
                <div className="flex flex-wrap items-center gap-2 mb-6" role="tablist" aria-label="How to shop">
                  {([
                    { id: 'street' as View, label: 'Walk the shops', icon: Store },
                    { id: 'lists' as View, label: 'Wish lists', icon: ListChecks },
                  ]).map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={view === t.id}
                      onClick={() => go(t.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${view === t.id ? 'bg-chalkboard text-white' : 'bg-white ring-1 ring-chalkboard/15 text-chalkboard hover:bg-chalkboard/5'}`}
                    >
                      <t.icon size={14} aria-hidden="true" /> {t.label}
                    </button>
                  ))}
                </div>

                {view === 'street' && (
                  <section aria-labelledby="street-heading">
                    <h2 id="street-heading" className="sr-only">Main Street</h2>

                    {/* What are you shopping for? */}
                    <div className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] p-5 sm:p-6 mb-6">
                      <p className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-3">
                        Your shopping list
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <ListChip active={goal === null} onClick={() => chooseGoal(null)}>Just browsing</ListChip>
                        {REFILL_LISTS.map((l) => (
                          <ListChip key={l.id} active={goal?.kind === 'bundle' && goal.list.id === l.id} onClick={() => chooseGoal({ kind: 'bundle', list: l })}>
                            {l.name}
                          </ListChip>
                        ))}
                        {wishlists.map((w) => (
                          <ListChip key={`w${w.id}`} active={goal?.kind === 'wishlist' && goal.list.id === w.id} onClick={() => chooseGoal({ kind: 'wishlist', list: w })}>
                            {w.label} · {w.school}
                          </ListChip>
                        ))}
                      </div>
                      {goal ? (
                        <div>
                          <p className="text-sm text-chalkboard/75 leading-relaxed mb-3">
                            {goal.kind === 'bundle' ? goal.list.blurb : goal.list.note || `What ${goal.list.label} at ${goal.list.school} asked for.`}
                            {' '}Shops holding something you still need are marked <span className="inline-flex items-center gap-1 bg-pencil text-chalkboard text-[0.5625rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full align-middle"><Sparkles size={9} aria-hidden="true" />List</span>.
                          </p>
                          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                            {goalItems(goal).map((need) => {
                              const item = findRefillItem(need.itemId)!;
                              const have = basket.find((l) => l.itemId === need.itemId)?.qty ?? 0;
                              const done = have >= need.qty;
                              return (
                                <li key={need.itemId} className={`flex items-center gap-2 text-sm ${done ? 'text-chalkboard/60 line-through decoration-apple/60' : 'text-chalkboard'}`}>
                                  {done ? <CircleCheck size={15} className="text-apple shrink-0" aria-hidden="true" /> : <Circle size={15} className="text-chalkboard/40 shrink-0" aria-hidden="true" />}
                                  <span className="sr-only">{done ? 'Found: ' : 'Still need: '}</span>
                                  {need.qty}× {item.name} <span className="text-chalkboard/60">({findRefillShop(item.shop)?.name})</span>
                                </li>
                              );
                            })}
                          </ul>
                          {listComplete && (
                            <p className="mt-4 text-sm font-bold text-apple flex items-center gap-2" role="status">
                              <CheckCircle2 size={16} aria-hidden="true" /> Everything on the list is in your basket. Head to the checkout.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-chalkboard/70 leading-relaxed">
                          Pick a list to fill, or just wander in anywhere and add what you like.
                        </p>
                      )}
                    </div>

                    <MallMap
                      shops={REFILL_SHOPS}
                      counts={counts}
                      needed={neededShops}
                      onEnter={enterShop}
                      paused={openShop !== null || checkingOut}
                    />

                    {/* The same seven shops as plain sections, for anyone who
                        would rather scroll than walk. */}
                    <details className="mt-6 group">
                      <summary className="cursor-pointer text-sm font-bold text-ruler underline underline-offset-4 decoration-ruler/30 hover:decoration-ruler list-none inline-flex items-center gap-2">
                        <Store size={14} aria-hidden="true" /> Rather skip the walk? Open every shop as a list
                      </summary>
                      <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        {REFILL_SHOPS.map((shop) => (
                          <ShopList key={shop.id} shop={shop} basket={basket} wanted={wanted} onChange={setQty} />
                        ))}
                      </div>
                    </details>
                  </section>
                )}

                {view === 'lists' && (
                  <section aria-labelledby="lists-heading">
                    <h2 id="lists-heading" className="font-serif font-bold text-2xl mb-2">Wish lists</h2>
                    <p className="text-sm text-chalkboard/75 leading-relaxed mb-6 max-w-2xl">
                      Fund a whole list with one button. Teachers' own lists come from their supply requests, shown
                      only with their permission and only as much of their name as they allowed.
                    </p>

                    {wishlists.length > 0 && (
                      <>
                        <h3 className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-3">Teachers' lists</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                          {wishlists.map((w) => (
                            <ListCard
                              key={w.id}
                              title={w.label}
                              subtitle={w.school}
                              blurb={w.note || 'What this classroom asked for in its Mid-Year Refill request.'}
                              items={w.items}
                              onFund={() => fundList({ kind: 'wishlist', list: w })}
                              onWalk={() => { chooseGoal({ kind: 'wishlist', list: w }); go('street'); }}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <h3 className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-3">
                      {wishlists.length > 0 ? 'FMT bundles' : 'Ready-made bundles'}
                    </h3>
                    {wishlists.length === 0 && (
                      <p className="text-xs text-chalkboard/70 mb-3 leading-relaxed">
                        Teachers' own lists appear here as their January requests come in. These bundles are built
                        from what classrooms ask us for most.
                      </p>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {REFILL_LISTS.map((l) => (
                        <ListCard
                          key={l.id}
                          title={l.name}
                          subtitle={l.forWhom}
                          blurb={l.blurb}
                          items={l.items}
                          onFund={() => fundList({ kind: 'bundle', list: l })}
                          onWalk={() => { chooseGoal({ kind: 'bundle', list: l }); go('street'); }}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* ── The basket ── */}
              <aside ref={panelRef} aria-labelledby="basket-heading" className="xl:sticky xl:top-28 scroll-mt-28">
                <div className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)] p-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 id="basket-heading" ref={headingRef} tabIndex={-1} className="font-serif font-bold text-2xl outline-none">Your basket</h2>
                    {packs > 0 && <span className="text-xs font-bold text-chalkboard/70">{packs} {packs === 1 ? 'pack' : 'packs'}</span>}
                  </div>

                  {basket.length === 0 ? (
                    <div className="py-8 text-center border-t border-chalkboard/10">
                      <ShoppingBasket size={22} className="mx-auto text-chalkboard/70 mb-3" aria-hidden="true" />
                      <p className="text-sm text-chalkboard/70 leading-relaxed">
                        Nothing yet. {view === 'street' ? 'Walk into a shop and add something.' : 'Fund a list, or walk the shops.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <ul className="border-t border-chalkboard/10 mb-5">
                        {basket.map((l) => {
                          const item = findRefillItem(l.itemId)!;
                          return (
                            <li key={l.itemId} className="flex items-center gap-3 py-3 border-b border-chalkboard/10">
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm font-bold leading-snug">{item.name}</span>
                                <span className="block text-xs text-chalkboard/70 mt-0.5">{item.pack} · {findRefillShop(item.shop)?.name}</span>
                                <span className="mt-1.5 inline-flex items-center gap-0.5 bg-paper rounded-lg p-0.5">
                                  <button onClick={() => setQty(l.itemId, l.qty - 1)} aria-label={`One fewer ${item.name}`} className="w-9 h-9 rounded-md hover:bg-chalkboard/10 flex items-center justify-center">
                                    <Minus size={12} aria-hidden="true" />
                                  </button>
                                  <span className="w-6 text-center text-xs font-bold tabular-nums" aria-label={`Quantity ${l.qty}`}>{l.qty}</span>
                                  <button onClick={() => setQty(l.itemId, l.qty + 1)} disabled={l.qty >= MAX_QTY} aria-label={`One more ${item.name}`} className="w-9 h-9 rounded-md hover:bg-chalkboard/10 flex items-center justify-center disabled:opacity-30">
                                    <Plus size={12} aria-hidden="true" />
                                  </button>
                                </span>
                              </span>
                              <span className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-sm font-bold tabular-nums">{formatRefillPrice(item.price * l.qty)}</span>
                                <button onClick={() => setQty(l.itemId, 0)} className="text-xs text-chalkboard/70 hover:text-apple underline underline-offset-2">
                                  Remove<span className="sr-only"> {item.name}</span>
                                </button>
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mb-4">
                        <label htmlFor="refill-school" className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 flex items-center gap-1.5">
                          <School size={11} aria-hidden="true" /> Which school is this for?
                        </label>
                        <select
                          id="refill-school"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full bg-paper ring-1 ring-chalkboard/15 focus:ring-2 focus:ring-apple/40 rounded-xl px-3.5 py-2.5 text-sm font-bold text-chalkboard outline-none"
                        >
                          <option value="general">Wherever it's needed most</option>
                          {SCHOOLS.map((s) => (
                            <option key={s.slug} value={`school:${s.slug}`}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {feeIfCovered > 0 && (
                        <label className="flex items-start gap-3 mb-3 cursor-pointer border-t border-chalkboard/10 pt-4">
                          <input type="checkbox" id="refill-cover-fee" name="coverFee" checked={coverFee} onChange={(e) => setCoverFee(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#c0392b] shrink-0" />
                          <span className="text-sm text-chalkboard/80 leading-snug">
                            Optional: add {formatRefillPrice(feeIfCovered)} so the full amount reaches the classroom. It covers what the card company charges us.
                          </span>
                        </label>
                      )}

                      <dl className={`space-y-1.5 text-sm pt-2 mb-5 ${feeIfCovered > 0 ? '' : 'border-t border-chalkboard/10 pt-4'}`}>
                        <div className="flex justify-between text-chalkboard/75">
                          <dt>Supplies</dt>
                          <dd className="tabular-nums">{formatRefillPrice(priced.subtotal)}</dd>
                        </div>
                        {priced.fee > 0 && (
                          <div className="flex justify-between text-chalkboard/75">
                            <dt>Card fee (optional), covered by you</dt>
                            <dd className="tabular-nums">{formatRefillPrice(priced.fee)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between font-serif font-bold text-xl pt-2">
                          <dt>Total</dt>
                          <dd className="tabular-nums">{formatRefillPrice(priced.total)}</dd>
                        </div>
                      </dl>

                      {goal && !listComplete ? (
                        <>
                          <p className="text-xs text-chalkboard/75 leading-relaxed mb-3" role="status">
                            Still on your list: {missing.map((m) => `${m.qty}× ${findRefillItem(m.itemId)?.name}`).join(', ')}.
                          </p>
                          <button onClick={startCheckout} className="w-full bg-white ring-2 ring-chalkboard text-chalkboard py-3.5 rounded-2xl font-bold hover:bg-chalkboard hover:text-white transition-colors">
                            Check out with what I have · {formatRefillPrice(priced.total)}
                          </button>
                        </>
                      ) : (
                        <button onClick={startCheckout} className="w-full bg-chalkboard text-white py-4 rounded-2xl font-bold hover:bg-apple transition-colors active:scale-[0.98] flex items-center justify-center gap-2">
                          Check out · {formatRefillPrice(priced.total)} <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      )}

                      <p className="text-xs text-chalkboard/70 leading-relaxed mt-4">
                        We buy these packs{schoolLabel ? ` for ${schoolLabel}` : ''} and deliver them {DELIVERY}. If one is out of stock or that
                        room is already covered, we put the money into the nearest equivalent supply. Tax-deductible
                        to the extent the law allows. Card payments by Stripe.
                      </p>
                    </>
                  )}
                </div>

                <p className="text-sm text-chalkboard/70 text-center mt-5 leading-relaxed">
                  Teach at a partner school?{' '}
                  <a {...navLinkProps('/for-teachers?kind=mid-year-refill')} className="text-apple font-bold underline underline-offset-2">
                    Tell us what your room needs
                  </a>
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Phone: the basket is below the street; this keeps it one tap away. */}
      <AnimatePresence>
        {view !== 'entrance' && packs > 0 && !panelInView && !checkingOut && !openShop && (
          <motion.div
            initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="xl:hidden fixed bottom-4 inset-x-4 z-[60] max-w-md mx-auto"
          >
            <button onClick={reviewBasket} className="w-full flex items-center justify-between gap-3 bg-chalkboard text-white rounded-full pl-5 pr-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
              <span className="flex items-center gap-2 text-sm font-bold">
                <ShoppingBasket size={15} aria-hidden="true" />
                {packs} {packs === 1 ? 'pack' : 'packs'} · {formatRefillPrice(priced.subtotal)}
              </span>
              <span className="bg-white text-chalkboard text-xs font-bold uppercase tracking-[0.14em] rounded-full px-4 py-2.5">
                {listComplete ? 'Check out' : 'Basket'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openShop && (
          <ShopSheet shop={openShop} basket={basket} wanted={wanted} onChange={setQty} onClose={() => setOpenShop(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkingOut && (
          <RefillCheckout
            lines={basket}
            coverFee={coverFee}
            designation={designation}
            goal={goal}
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

// ── Small pieces ────────────────────────────────────────────────────────────

function DoorCard({ icon: Icon, eyebrow, title, body, cta, onClick, primary = false }: {
  icon: typeof Footprints; eyebrow: string; title: string; body: string; cta: string; onClick: () => void; primary?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: primary ? 0.1 : 0.2 }}
      className={`group text-left rounded-[1.75rem] p-7 sm:p-8 ring-1 transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ruler ${
        primary ? 'bg-chalkboard text-white ring-chalkboard shadow-[0_18px_50px_-12px_rgba(0,0,0,0.3)]' : 'bg-white text-chalkboard ring-chalkboard/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
      }`}
    >
      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${primary ? 'bg-white/10 text-pencil' : 'bg-apple/10 text-apple'}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className={`block text-[0.625rem] uppercase tracking-[0.2em] font-bold mb-2 ${primary ? 'text-white/70' : 'text-chalkboard/70'}`}>{eyebrow}</span>
      <span className="block font-serif font-bold text-2xl sm:text-3xl mb-3">{title}</span>
      <span className={`block text-sm leading-relaxed mb-6 ${primary ? 'text-white/80' : 'text-chalkboard/75'}`}>{body}</span>
      <span className={`inline-flex items-center gap-2 text-sm font-bold ${primary ? 'text-pencil' : 'text-apple'}`}>
        {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </motion.button>
  );
}

function ListChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${active ? 'bg-apple text-white' : 'bg-paper ring-1 ring-chalkboard/15 text-chalkboard hover:bg-chalkboard/5'}`}
    >
      {children}
    </button>
  );
}

function ListCard({ title, subtitle, blurb, items, onFund, onWalk }: {
  title: string; subtitle: string; blurb: string; items: readonly RefillLine[]; onFund: () => void; onWalk: () => void;
}) {
  const total = priceRefillOrder(items, { coverFee: false }).subtotal;
  return (
    <article className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 flex flex-col">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h4 className="font-serif font-bold text-lg leading-snug">{title}</h4>
        <p className="font-serif font-bold text-lg tabular-nums shrink-0">{formatRefillPrice(total)}</p>
      </div>
      <p className="text-xs text-chalkboard/70 mb-3">{subtitle}</p>
      <p className="text-sm text-chalkboard/75 leading-relaxed mb-4">{blurb}</p>
      <ul className="text-xs text-chalkboard/80 space-y-1 mb-5">
        {items.map((l) => {
          const item = findRefillItem(l.itemId);
          return item ? <li key={l.itemId}>{l.qty}× {item.name} <span className="text-chalkboard/60">({item.pack})</span></li> : null;
        })}
      </ul>
      <div className="mt-auto flex flex-col gap-2">
        <button onClick={onFund} className="w-full bg-chalkboard text-white py-3 rounded-xl font-bold text-sm hover:bg-apple transition-colors flex items-center justify-center gap-2">
          <Check size={14} strokeWidth={2.5} aria-hidden="true" /> Fund this list
        </button>
        <button onClick={onWalk} className="text-xs font-bold text-ruler underline underline-offset-4 decoration-ruler/30 hover:decoration-ruler py-1">
          Or collect it yourself on Main Street
        </button>
      </div>
    </article>
  );
}

/** One shop as a plain list of items: the no-walking version of ShopSheet. */
function ShopList({ shop, basket, wanted, onChange }: {
  shop: RefillShop; basket: RefillLine[]; wanted: Map<string, number>; onChange: (itemId: string, qty: number) => void;
}) {
  const qtyOf = (id: string) => basket.find((l) => l.itemId === id)?.qty ?? 0;
  return (
    <section aria-labelledby={`shoplist-${shop.id}`} className="bg-white rounded-2xl ring-1 ring-chalkboard/[0.08] overflow-hidden">
      <h3 id={`shoplist-${shop.id}`} className="font-hand text-xl px-5 py-3" style={{ background: `hsl(${shop.hue} 55% 92%)`, color: `hsl(${shop.hue} 45% 32%)` }}>
        {shop.name}
      </h3>
      <ul className="divide-y divide-chalkboard/10">
        {itemsInShop(shop.id).map((item: RefillItem) => {
          const qty = qtyOf(item.id);
          const want = wanted.get(item.id) ?? 0;
          return (
            <li key={item.id} className="flex items-center gap-3 px-5 py-2.5">
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold leading-snug">{item.name}{want > 0 && (qty >= want ? <span className="text-apple font-bold"> · on your list ✓</span> : <span className="text-pencil-dark font-bold"> · list needs {want}</span>)}</span>
                <span className="block text-xs text-chalkboard/70">{item.pack} · {formatRefillPrice(item.price)}</span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-0.5 bg-paper rounded-lg p-0.5">
                <button onClick={() => onChange(item.id, qty - 1)} disabled={qty === 0} aria-label={`One fewer ${item.name}`} className="w-8 h-8 rounded-md hover:bg-chalkboard/10 flex items-center justify-center disabled:opacity-30">
                  <Minus size={12} aria-hidden="true" />
                </button>
                <span className="w-6 text-center text-xs font-bold tabular-nums" aria-label={`Quantity ${qty}`}>{qty}</span>
                <button onClick={() => onChange(item.id, qty + 1)} disabled={qty >= MAX_QTY} aria-label={`One more ${item.name}`} className="w-8 h-8 rounded-md hover:bg-chalkboard/10 flex items-center justify-center disabled:opacity-30">
                  <Plus size={12} aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
