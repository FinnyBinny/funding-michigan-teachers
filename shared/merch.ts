/**
 * The merch catalogue, shared by the shop page and the Cloudflare Worker.
 *
 * Both import this file, which is the point: the browser sends only product
 * ids, sizes and quantities, and the Worker looks the prices up here. Nothing
 * a visitor can edit ever decides what they get charged — a page that posts
 * its own prices to Stripe can be bought from for a dollar.
 *
 * Imports only shared/fees.ts, so the Worker can bundle it.
 */
import { coverFee } from './fees';

export type MerchSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export const MERCH_SIZES: readonly MerchSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export interface MerchColor {
  id: string;
  name: string;
  /** Swatch fill. `speckle` adds flecks over it for the heather colorway. */
  hex: string;
  speckle?: boolean;
  /** True when the garment is light enough that artwork needs dark ink. */
  light?: boolean;
}

export const MERCH_COLORS: readonly MerchColor[] = [
  { id: 'speckled-black', name: 'Speckled Black', hex: '#2b2b2e', speckle: true },
  { id: 'white', name: 'White', hex: '#f4f2ed', light: true },
  { id: 'navy', name: 'Navy', hex: '#1e2a44' },
];

export interface MerchProduct {
  id: string;
  name: string;
  /** Retail price in cents. */
  price: number;
  /**
   * What the item costs FMT to make, in cents — this is what a teacher pays.
   * The t-shirt is exact: $5 DTF film from Swift Prints plus a ~$9 blank.
   *
   * ⚠️ The sweatshirt and hoodie figures are ESTIMATES and need replacing with
   * real blank costs before launch. They set the teacher price, so a wrong
   * number here either loses money on every teacher order or overcharges the
   * people this organization exists to help.
   */
  cost: number;
  blurb: string;
  /** Longer description shown when the product is selected. */
  detail: string;
}

export const MERCH: readonly MerchProduct[] = [
  {
    id: 'tee',
    name: 'FMT T-Shirt',
    price: 2500,
    cost: 1400, // exact: $5 film + $9 blank
    blurb: 'Soft cotton tee, pressed by hand.',
    detail:
      'The everyday one. DTF-printed by Swift Prints here in town, then heat-pressed by our students one shirt at a time.',
  },
  {
    id: 'sweatshirt',
    name: 'FMT Crewneck Sweatshirt',
    price: 4000,
    cost: 2500, // ESTIMATE — replace with the real blank cost
    blurb: 'Midweight crewneck for the staff room.',
    detail:
      'Warm enough for a cold classroom in February. Same hand-pressed print, same local shop.',
  },
  {
    id: 'hoodie',
    name: 'FMT Hoodie',
    price: 4500,
    cost: 3000, // ESTIMATE — replace with the real blank cost
    blurb: 'Heavyweight hooded sweatshirt.',
    detail:
      'The one people actually live in. Thick, roomy, and printed to outlast the school year.',
  },
];

/** Delivery for anyone who cannot collect in person. */
export const DELIVERY_FEE = 500;
/** Order value at or above which delivery is free. */
export const FREE_DELIVERY_OVER = 5000;

export type Fulfilment = 'pickup' | 'delivery';

export interface CartLine {
  productId: string;
  size: string;
  colorId: string;
  qty: number;
}

export function findProduct(id: string): MerchProduct | undefined {
  return MERCH.find((p) => p.id === id);
}

export function unitPrice(p: MerchProduct, atCost?: boolean): number {
  return atCost ? p.cost : p.price;
}

export interface PricedItem {
  /** "FMT T-Shirt — Navy, M" — what the receipt and the packing list say. */
  name: string;
  description: string;
  /** Cents. */
  unitAmount: number;
  quantity: number;
}

export interface PricingOptions {
  fulfilment: Fulfilment;
  /**
   * Teacher pricing, claimed with the "I'm a teacher" box. That box is an
   * honour system on purpose: at cost, FMT makes nothing on the order but
   * loses nothing either.
   */
  educator: boolean;
  /**
   * The kind of code that applies. The Worker passes the kind of a code it
   * has looked up itself; the page passes the kind the Worker told it about.
   * Never a kind the page decided on its own.
   */
  codeKind: CodeKind | null;
  /** The buyer chose to cover the card processing fee. */
  coverFee: boolean;
}

export interface PricedOrder {
  /** Garments, then delivery, then the covered fee: exactly what Stripe charges. */
  items: PricedItem[];
  /** Garments as charged, after educator pricing and any free tee. */
  merchandise: number;
  /** What the free tee would have cost, so the page can show it. */
  freeTeeSavings: number;
  delivery: number;
  fee: number;
  total: number;
}

/**
 * Prices an order. The page calls it to show the total; the Worker calls it,
 * independently, to build what Stripe charges. One function, so the two
 * cannot disagree — before this, the page ignored a free-tee code and showed
 * $25 for an order Stripe then charged $0.
 */
export function priceOrder(lines: CartLine[], o: PricingOptions): PricedOrder {
  const educator = o.educator || o.codeKind === 'educator';
  // A free-tee code covers exactly one shirt; the rest of that line, and
  // everything else, is charged normally.
  let freeTeeRemaining = o.codeKind === 'free-tee' ? 1 : 0;

  const items: PricedItem[] = [];
  let merchandise = 0;
  let freeTeeSavings = 0;
  let goodsValue = 0;

  for (const l of lines) {
    const product = findProduct(l.productId);
    const color = MERCH_COLORS.find((c) => c.id === l.colorId);
    if (!product || !color) continue;
    const unit = unitPrice(product, educator);
    const name = `${product.name} — ${color.name}, ${l.size}`;
    goodsValue += unit * l.qty;

    let freeHere = 0;
    if (freeTeeRemaining > 0 && product.id === 'tee') {
      freeHere = Math.min(freeTeeRemaining, l.qty);
      freeTeeRemaining -= freeHere;
      freeTeeSavings += unit * freeHere;
      items.push({ name, description: 'Teacher of the Month — on us.', unitAmount: 0, quantity: freeHere });
    }
    if (l.qty - freeHere > 0) {
      items.push({
        name,
        description: educator
          ? 'Educator pricing: sold at our cost, no margin to FMT.'
          : 'Funding Michigan Teachers · 501(c)(3) EIN 93-4485967',
        unitAmount: unit,
        quantity: l.qty - freeHere,
      });
      merchandise += unit * (l.qty - freeHere);
    }
  }

  // Delivery is judged on what the garments are worth, free tee included, so
  // a free shirt still pays its own delivery.
  const delivery =
    o.fulfilment === 'delivery' && goodsValue > 0 && goodsValue < FREE_DELIVERY_OVER ? DELIVERY_FEE : 0;
  if (delivery > 0) {
    items.push({ name: 'Local delivery', description: `Free on orders over ${formatPrice(FREE_DELIVERY_OVER)}.`, unitAmount: delivery, quantity: 1 });
  }

  const beforeFee = merchandise + delivery;
  const fee = o.coverFee && beforeFee > 0 ? coverFee(beforeFee).feeCents : 0;
  if (fee > 0) {
    items.push({
      name: 'Card processing fee, covered by you',
      description: 'Optional. Means the full price of your order reaches FMT.',
      unitAmount: fee,
      quantity: 1,
    });
  }

  return { items, merchandise, freeTeeSavings, delivery, fee, total: beforeFee + fee };
}

/** Validates a cart from the browser. Returns an error string, or null. */
export function validateCart(lines: unknown): string | null {
  if (!Array.isArray(lines) || lines.length === 0) return 'Your bag is empty.';
  if (lines.length > 20) return 'That is more items than this form can handle — email us instead.';

  for (const l of lines as CartLine[]) {
    const p = findProduct(String(l?.productId));
    if (!p) return 'One of those items is no longer available.';
    if (!MERCH_SIZES.includes(l?.size as MerchSize)) return 'Pick a size for every item.';
    if (!MERCH_COLORS.some((c) => c.id === l?.colorId)) return 'Pick a color for every item.';
    const qty = Number(l?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return 'Quantities must be between 1 and 10.';
  }
  return null;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;
}

/* ── Codes ──────────────────────────────────────────────────────────────────
 *
 * Codes are NEVER defined in this file. Anything written here ships inside the
 * JavaScript every visitor downloads, so a "secret" code would be readable by
 * anyone who opens dev tools — the same reason the IP blocklist lives in an
 * environment variable rather than in the repo.
 *
 * They live in the Cloudflare dashboard instead, as a MERCH_CODES variable on
 * the Worker (Settings → Variables and Secrets), in the form:
 *
 *     OKEMOS26:educator, TOM-OCT26:free-tee, HASLETT26:educator
 *
 *   educator  — the whole order is sold at cost, no margin to FMT
 *   free-tee  — one t-shirt is free; everything else is charged normally
 *
 * Because an environment variable cannot count redemptions, a code is reusable
 * until it is changed. That is a deliberate trade: rotate the free-shirt code
 * each month (TOM-OCT26, TOM-NOV26) so a leak costs one month rather than a
 * season, and edit the variable to kill a code instantly with no deploy.
 */

export type CodeKind = 'educator' | 'free-tee';

export interface MerchCode {
  code: string;
  kind: CodeKind;
}

/** Parses the MERCH_CODES variable. Unknown kinds are ignored, not guessed. */
export function parseCodes(raw: string | undefined): MerchCode[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => {
      const [code, kind] = entry.split(':').map((x) => x.trim());
      if (!code || (kind !== 'educator' && kind !== 'free-tee')) return null;
      return { code: code.toUpperCase(), kind: kind as CodeKind };
    })
    .filter((c): c is MerchCode => c !== null);
}

export function findCode(raw: string | undefined, entered: string): MerchCode | null {
  const want = entered.trim().toUpperCase();
  if (!want) return null;
  return parseCodes(raw).find((c) => c.code === want) ?? null;
}

export const CODE_LABEL: Record<CodeKind, string> = {
  educator: 'Educator pricing applied — you pay our cost.',
  'free-tee': 'One free t-shirt applied. Thank you for everything you do.',
};
