/**
 * The Mid-Year Refill store: shops, items, bundles and pricing.
 *
 * Shared by the /refill page and the Cloudflare Worker, for the same reason
 * shared/merch.ts is: the browser sends item ids and quantities, never prices,
 * and the Worker looks every amount up here before it talks to Stripe.
 *
 * ── What a shopper is buying ────────────────────────────────────────────────
 * Not goods. A refill order is a donation to FMT, a 501(c)(3), earmarked for
 * the supplies in the basket; FMT buys them and delivers them to classrooms
 * the week of January 12th. The page says so, and the Stripe line items say
 * "Donation: …" so the receipt matches.
 *
 * ── Amazon ──────────────────────────────────────────────────────────────────
 * Every item carries `asin`, the 10-character code in an Amazon product URL
 * (amazon.com/dp/B0XXXXXXXX). Once a payment lands, the Worker's Stripe
 * webhook records the item ids and quantities; the admin panel turns those
 * into one "add everything to my Amazon cart" link (Amazon's documented
 * add-to-cart form, see amazonCartUrl) and the same list arrives by email.
 *
 * ⚠️  Every `asin` below is EMPTY until someone pastes the real one in. The
 * site works without them — orders are recorded by item id, and the admin
 * list names each item — but the one-click Amazon cart only carries items
 * whose ASIN is filled in, and flags the rest. Prices are estimates of what
 * the pack costs on Amazon; update them alongside the ASIN.
 *
 * Imports only shared/fees.ts, so the Worker can bundle it.
 */
import { coverFee } from './fees';

export interface RefillShop {
  id: string;
  /** The sign over the door. */
  name: string;
  /** One line under the sign. */
  tagline: string;
  /** Storefront paint: a hue (0–360) the page turns into a wall colour. */
  hue: number;
}

export const REFILL_SHOPS: readonly RefillShop[] = [
  { id: 'write', name: 'The Pencil Pantry', tagline: 'Pencils, pens and the markers that always run dry', hue: 8 },
  { id: 'paper', name: 'Paper & Post', tagline: 'Copy paper, notebooks and sticky notes', hue: 200 },
  { id: 'clean', name: 'The Tissue Depot', tagline: 'Tissues, sanitizer and wipes for flu season', hue: 150 },
  { id: 'art', name: 'Art Corner', tagline: 'Markers, crayons, glue and construction paper', hue: 280 },
  { id: 'stem', name: 'The STEM Shed', tagline: 'Batteries, goggles, graph paper and whiteboards', hue: 40 },
  { id: 'snacks', name: 'The Snack Shack', tagline: 'For the drawer every teacher keeps for hungry kids', hue: 330 },
  { id: 'organize', name: 'Tidy Town', tagline: 'Bins, folders and clips that keep a room running', hue: 180 },
];

export interface RefillItem {
  id: string;
  shop: string;
  name: string;
  /** "72-pack", "12 boxes" — the unit one quantity buys. */
  pack: string;
  /** Estimated Amazon price for one pack, in cents. */
  price: number;
  /** Amazon ASIN (10 characters). Empty until filled in — see the file comment. */
  asin: string;
}

export const REFILL_ITEMS: readonly RefillItem[] = [
  // ── The Pencil Pantry ──
  { id: 'pencils-72', shop: 'write', name: 'Ticonderoga #2 pencils', pack: '72-pack', price: 1699, asin: '' },
  { id: 'pens-60', shop: 'write', name: 'Ballpoint pens, blue and black', pack: '60-pack', price: 999, asin: '' },
  { id: 'dry-erase-12', shop: 'write', name: 'Expo dry-erase markers', pack: '12-pack', price: 1299, asin: '' },
  { id: 'highlighters-12', shop: 'write', name: 'Highlighters, assorted', pack: '12-pack', price: 699, asin: '' },
  { id: 'erasers-30', shop: 'write', name: 'Pink erasers', pack: '30-pack', price: 799, asin: '' },
  { id: 'sharpies-12', shop: 'write', name: 'Sharpie permanent markers', pack: '12-pack', price: 1099, asin: '' },
  // Added from teacher requests (November 2026). The ASINs are the products
  // the teachers themselves linked; prices are estimates like the rest.
  { id: 'gel-pens-color-8', shop: 'write', name: 'BIC Gel-ocity gel pens, assorted colors', pack: '8-pack', price: 999, asin: 'B01N5TKJBH' },
  { id: 'g2-pens-color', shop: 'write', name: 'Pilot G2 gel pens, assorted colors', pack: '8-pack', price: 1299, asin: '' },
  // ── Paper & Post ──
  { id: 'copy-paper-ream', shop: 'paper', name: 'Copy paper', pack: '1 ream (500 sheets)', price: 899, asin: '' },
  { id: 'copy-paper-case', shop: 'paper', name: 'Copy paper', pack: 'case of 10 reams', price: 5499, asin: '' },
  { id: 'notebooks-12', shop: 'paper', name: 'Spiral notebooks, wide ruled', pack: '12-pack', price: 1599, asin: '' },
  { id: 'sticky-notes-12', shop: 'paper', name: 'Sticky notes', pack: '12 pads', price: 1199, asin: '' },
  { id: 'index-cards-1000', shop: 'paper', name: 'Index cards', pack: '1,000 cards', price: 1299, asin: '' },
  { id: 'folders-25', shop: 'paper', name: 'Two-pocket folders', pack: '25-pack', price: 1499, asin: '' },
  { id: 'dictionary-thesaurus', shop: 'paper', name: "Merriam-Webster's Dictionary & Thesaurus, hardcover", pack: '1 book', price: 1699, asin: '0877793522' },
  // ── The Tissue Depot ──
  { id: 'tissues-12', shop: 'clean', name: 'Facial tissues', pack: '12 boxes', price: 2199, asin: '' },
  { id: 'sanitizer-1l', shop: 'clean', name: 'Hand sanitizer pump', pack: '1 litre', price: 1099, asin: '' },
  { id: 'wipes-3', shop: 'clean', name: 'Disinfecting wipes', pack: '3 canisters', price: 1299, asin: '' },
  { id: 'paper-towels-6', shop: 'clean', name: 'Paper towels', pack: '6 rolls', price: 1499, asin: '' },
  { id: 'bandages-100', shop: 'clean', name: 'Adhesive bandages', pack: '100-count', price: 699, asin: '' },
  // ── Art Corner ──
  { id: 'markers-class', shop: 'art', name: 'Crayola washable markers', pack: 'classpack of 200', price: 3499, asin: '' },
  { id: 'markers-basics', shop: 'art', name: 'Amazon Basics washable markers', pack: '1 pack, assorted colors', price: 899, asin: 'B0DPM79QWL' },
  { id: 'crayons-class', shop: 'art', name: 'Crayola crayons', pack: 'classpack of 400', price: 2999, asin: '' },
  { id: 'colored-pencils-12x12', shop: 'art', name: 'Colored pencils', pack: '12 boxes of 12', price: 1999, asin: '' },
  { id: 'glue-sticks-30', shop: 'art', name: 'Glue sticks', pack: '30-pack', price: 1299, asin: '' },
  { id: 'construction-paper-500', shop: 'art', name: 'Construction paper', pack: '500 sheets', price: 1499, asin: '' },
  { id: 'scissors-12', shop: 'art', name: 'Student scissors', pack: '12-pack', price: 1499, asin: '' },
  { id: 'tape-6', shop: 'art', name: 'Scotch tape with dispensers', pack: '6 rolls', price: 1199, asin: '' },
  // ── The STEM Shed ──
  { id: 'batteries-aa-48', shop: 'stem', name: 'AA batteries', pack: '48-pack', price: 1899, asin: '' },
  { id: 'goggles-12', shop: 'stem', name: 'Safety goggles', pack: '12-pack', price: 2499, asin: '' },
  { id: 'rulers-30', shop: 'stem', name: '12-inch rulers', pack: '30-pack', price: 1299, asin: '' },
  { id: 'graph-paper-500', shop: 'stem', name: 'Graph paper', pack: '500 sheets', price: 1299, asin: '' },
  { id: 'calculator-ti30', shop: 'stem', name: 'TI-30XS scientific calculator', pack: '1 calculator', price: 1999, asin: '' },
  { id: 'whiteboards-12', shop: 'stem', name: 'Lap whiteboards', pack: '12-pack', price: 2999, asin: '' },
  // ── The Snack Shack ──
  { id: 'granola-60', shop: 'snacks', name: 'Granola bars', pack: '60 bars', price: 2499, asin: '' },
  { id: 'goldfish-30', shop: 'snacks', name: 'Goldfish crackers', pack: '30 bags', price: 1699, asin: '' },
  { id: 'fruit-snacks-90', shop: 'snacks', name: 'Fruit snacks', pack: '90 pouches', price: 1999, asin: '' },
  // ── Tidy Town ──
  { id: 'bins-6', shop: 'organize', name: 'Storage bins with lids', pack: '6-pack', price: 2499, asin: '' },
  { id: 'binder-clips-150', shop: 'organize', name: 'Binder clips, assorted', pack: '150-count', price: 999, asin: '' },
  { id: 'ziploc-200', shop: 'organize', name: 'Zip-top bags', pack: '200-count', price: 1299, asin: '' },
  { id: 'hanging-folders-25', shop: 'organize', name: 'Hanging file folders', pack: '25-pack', price: 1699, asin: '' },
  { id: 'command-hooks-20', shop: 'organize', name: 'Command hooks', pack: '20-pack', price: 1499, asin: '' },
  { id: 'stapler-kit', shop: 'organize', name: 'Stapler with staples', pack: 'stapler + 5,000 staples', price: 1499, asin: '' },
];

/** One line of a basket: an item id and how many packs. */
export interface RefillLine {
  itemId: string;
  qty: number;
}

/**
 * A ready-made list: what a shopper sets out to find.
 *
 * These are FMT's own bundles, built from what teachers ask for most (the
 * quick-fills on /for-teachers: pencils, dry-erase markers, tissues, paper,
 * notebooks, markers). Lists for a specific teacher's room live in the
 * database (refill_wishlists), added through the admin panel once that
 * teacher has sent a request and said we may show it.
 */
export interface RefillList {
  id: string;
  name: string;
  /** Who it's for, in words: "Any classroom in February". */
  forWhom: string;
  blurb: string;
  items: readonly RefillLine[];
}

export const REFILL_LISTS: readonly RefillList[] = [
  {
    id: 'tissue-run',
    name: 'The Tissue Run',
    forWhom: 'Any classroom, every February',
    blurb: 'The request we get most. Tissues go first, then sanitizer, then wipes.',
    items: [{ itemId: 'tissues-12', qty: 2 }, { itemId: 'sanitizer-1l', qty: 1 }, { itemId: 'wipes-3', qty: 1 }],
  },
  {
    id: 'writing-restock',
    name: 'Writing Restock',
    forWhom: 'A room that is out of pencils, again',
    blurb: 'Pencils and dry-erase markers disappear fastest of anything on a supply list.',
    items: [{ itemId: 'pencils-72', qty: 2 }, { itemId: 'dry-erase-12', qty: 2 }, { itemId: 'erasers-30', qty: 1 }, { itemId: 'sharpies-12', qty: 1 }],
  },
  {
    id: 'paper-chase',
    name: 'Paper Chase',
    forWhom: 'English, history and anyone who prints',
    blurb: 'A case of copy paper, notebooks for the kids who come without, and sticky notes.',
    items: [{ itemId: 'copy-paper-case', qty: 1 }, { itemId: 'notebooks-12', qty: 1 }, { itemId: 'sticky-notes-12', qty: 1 }],
  },
  {
    id: 'art-room',
    name: 'Art Room Refill',
    forWhom: 'Art, elementary and special education rooms',
    blurb: 'Classpacks of markers and crayons, construction paper and glue.',
    items: [{ itemId: 'markers-class', qty: 1 }, { itemId: 'crayons-class', qty: 1 }, { itemId: 'construction-paper-500', qty: 1 }, { itemId: 'glue-sticks-30', qty: 1 }],
  },
  {
    id: 'science-lab',
    name: 'Science Lab Restock',
    forWhom: 'Biology, chemistry and physics',
    blurb: 'Goggles that are not scratched, batteries for the probes, and lap whiteboards.',
    items: [{ itemId: 'goggles-12', qty: 1 }, { itemId: 'batteries-aa-48', qty: 1 }, { itemId: 'graph-paper-500', qty: 1 }, { itemId: 'whiteboards-12', qty: 1 }],
  },
  {
    id: 'snack-drawer',
    name: 'The Snack Drawer',
    forWhom: 'The teacher who keeps one for hungry kids',
    blurb: 'Most teachers stock this out of their own pocket. This one is on you instead.',
    items: [{ itemId: 'granola-60', qty: 1 }, { itemId: 'goldfish-30', qty: 1 }, { itemId: 'fruit-snacks-90', qty: 1 }],
  },
  {
    id: 'whole-classroom',
    name: 'Stock a Whole Classroom',
    forWhom: 'One room, set for the rest of the year',
    blurb: 'Everything above in one trip: writing, paper, tissues, art supplies and snacks.',
    items: [
      { itemId: 'pencils-72', qty: 1 }, { itemId: 'dry-erase-12', qty: 1 }, { itemId: 'copy-paper-case', qty: 1 },
      { itemId: 'tissues-12', qty: 1 }, { itemId: 'sticky-notes-12', qty: 1 }, { itemId: 'glue-sticks-30', qty: 1 },
      { itemId: 'markers-class', qty: 1 }, { itemId: 'granola-60', qty: 1 },
    ],
  },
];

/** Most packs of one item a single order may hold. */
export const MAX_QTY = 20;
/** Most distinct items in one order: keeps Stripe metadata and the cart URL sane. */
export const MAX_LINES = 40;

export function findRefillItem(id: string): RefillItem | undefined {
  return REFILL_ITEMS.find((i) => i.id === id);
}

export function findRefillShop(id: string): RefillShop | undefined {
  return REFILL_SHOPS.find((s) => s.id === id);
}

export function findRefillList(id: string): RefillList | undefined {
  return REFILL_LISTS.find((l) => l.id === id);
}

export function itemsInShop(shopId: string): RefillItem[] {
  return REFILL_ITEMS.filter((i) => i.shop === shopId);
}

/** "$16.99" */
export function formatRefillPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Why an order cannot be priced, or null when it can. The Worker refuses a
 * cart this returns a message for, before it does anything else.
 */
export function validateRefillCart(lines: unknown): string | null {
  if (!Array.isArray(lines) || lines.length === 0) return 'The basket is empty.';
  if (lines.length > MAX_LINES) return `An order can hold at most ${MAX_LINES} different items.`;
  const seen = new Set<string>();
  for (const l of lines as Partial<RefillLine>[]) {
    if (!l || typeof l.itemId !== 'string' || !findRefillItem(l.itemId)) return 'An item in the basket is not one we stock.';
    if (!Number.isInteger(l.qty) || (l.qty as number) < 1 || (l.qty as number) > MAX_QTY) {
      return `Quantities must be between 1 and ${MAX_QTY}.`;
    }
    if (seen.has(l.itemId)) return 'An item appears twice in the basket.';
    seen.add(l.itemId);
  }
  return null;
}

/** Combines duplicate lines and drops unknown ids and zero quantities. */
export function normalizeRefillLines(lines: readonly RefillLine[]): RefillLine[] {
  const byId = new Map<string, number>();
  for (const l of lines) {
    if (!findRefillItem(l.itemId) || !Number.isFinite(l.qty)) continue;
    const qty = Math.min(MAX_QTY, Math.max(0, Math.floor(l.qty)));
    if (qty === 0) continue;
    byId.set(l.itemId, Math.min(MAX_QTY, (byId.get(l.itemId) ?? 0) + qty));
  }
  return [...byId].map(([itemId, qty]) => ({ itemId, qty }));
}

export interface RefillPricingOptions {
  /** The optional, itemized card-fee line (shared/fees.ts). */
  coverFee: boolean;
}

export interface RefillPriced {
  /** Stripe line items: a donation line per pack, then the fee if covered. */
  items: Array<{ name: string; description: string; unitAmount: number; quantity: number }>;
  /** Supplies only, in cents. */
  subtotal: number;
  /** The covered card fee, or 0. */
  fee: number;
  /** What the card is charged. */
  total: number;
  /** How many packs, all items together. */
  packs: number;
}

/**
 * The one pricing function. The page shows its numbers; the Worker charges
 * them. Unknown items are skipped rather than charged, and validateRefillCart
 * is what refuses them up front.
 */
export function priceRefillOrder(lines: readonly RefillLine[], o: RefillPricingOptions): RefillPriced {
  const items: RefillPriced['items'] = [];
  let subtotal = 0;
  let packs = 0;
  for (const l of lines) {
    const item = findRefillItem(l.itemId);
    if (!item || !(l.qty >= 1)) continue;
    const qty = Math.min(MAX_QTY, Math.floor(l.qty));
    items.push({
      name: `Donation: ${item.name}`,
      description: `${item.pack}, bought and delivered by FMT in the January refill`,
      unitAmount: item.price,
      quantity: qty,
    });
    subtotal += item.price * qty;
    packs += qty;
  }
  let fee = 0;
  if (o.coverFee && subtotal > 0) {
    fee = coverFee(subtotal).feeCents;
    items.push({
      name: 'Card processing fee, covered by you',
      description: 'Optional. Means the full amount reaches the classroom.',
      unitAmount: fee,
      quantity: 1,
    });
  }
  return { items, subtotal, fee, total: subtotal + fee, packs };
}

/** Which of a list's items are still missing from the basket, and by how many. */
export function missingFromList(list: RefillList, basket: readonly RefillLine[]): RefillLine[] {
  const have = new Map(basket.map((l) => [l.itemId, l.qty]));
  return list.items
    .map((need) => ({ itemId: need.itemId, qty: need.qty - (have.get(need.itemId) ?? 0) }))
    .filter((l) => l.qty > 0);
}

// ── Carrying an order through Stripe and back ───────────────────────────────

/**
 * "pencils-72:2;tissues-12:1" — the basket as Stripe metadata (500-char cap).
 * Item ids rather than ASINs, so an ASIN pasted in later still applies to
 * orders already placed.
 */
export function encodeRefillLines(lines: readonly RefillLine[]): string {
  return lines.map((l) => `${l.itemId}:${l.qty}`).join(';');
}

export function decodeRefillLines(raw: unknown): RefillLine[] {
  if (typeof raw !== 'string' || !raw) return [];
  const out: RefillLine[] = [];
  for (const part of raw.split(';')) {
    const m = /^([a-z0-9-]{1,40}):(\d{1,3})$/.exec(part.trim());
    if (m && findRefillItem(m[1])) out.push({ itemId: m[1], qty: Number(m[2]) });
  }
  return normalizeRefillLines(out);
}

/** "2× Ticonderoga #2 pencils (72-pack); 1× Facial tissues (12 boxes)" */
export function describeRefillLines(lines: readonly RefillLine[]): string {
  return lines
    .map((l) => {
      const it = findRefillItem(l.itemId);
      return it ? `${l.qty}× ${it.name} (${it.pack})` : null;
    })
    .filter(Boolean)
    .join('; ');
}

/** An Amazon ASIN: ten letters and digits. Empty strings are "not yet set". */
export function isAsin(s: string): boolean {
  return /^[A-Z0-9]{10}$/.test(s);
}

/**
 * Amazon's add-to-cart form, as a link. Opening it puts every listed item
 * into the cart of whoever is signed in to Amazon, in one go — the closest
 * thing to an API Amazon offers a small nonprofit. Items without an ASIN are
 * left out; the caller should say which.
 *
 * Documented at: Amazon Associates › Product Advertising › "Add to Cart form".
 * It is a plain GET, so it works as an <a href>.
 */
export function amazonCartUrl(lines: readonly RefillLine[]): { url: string | null; skipped: RefillLine[] } {
  const params: string[] = [];
  const skipped: RefillLine[] = [];
  let n = 0;
  for (const l of lines) {
    const it = findRefillItem(l.itemId);
    if (!it || !isAsin(it.asin)) {
      skipped.push(l);
      continue;
    }
    n++;
    params.push(`ASIN.${n}=${it.asin}&Quantity.${n}=${l.qty}`);
  }
  return { url: n ? `https://www.amazon.com/gp/aws/cart/add.html?${params.join('&')}` : null, skipped };
}

/** Sum several orders' baskets into one shopping list. */
export function aggregateRefillLines(orders: ReadonlyArray<readonly RefillLine[]>): RefillLine[] {
  const byId = new Map<string, number>();
  for (const lines of orders) {
    for (const l of lines) byId.set(l.itemId, (byId.get(l.itemId) ?? 0) + l.qty);
  }
  return [...byId].map(([itemId, qty]) => ({ itemId, qty }));
}
