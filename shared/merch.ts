/**
 * The merch catalogue, shared by the shop page and the Cloudflare Worker.
 *
 * Both import this file, which is the point: the browser sends only product
 * ids, sizes and quantities, and the Worker looks the prices up here. Nothing
 * a visitor can edit ever decides what they get charged — a page that posts
 * its own prices to Stripe can be bought from for a dollar.
 *
 * Deliberately dependency-free so the Worker can import it.
 */

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
  /** Teacher pricing: the item is sold at cost, with no margin for FMT. */
  atCost?: boolean;
}

export function findProduct(id: string): MerchProduct | undefined {
  return MERCH.find((p) => p.id === id);
}

export function unitPrice(p: MerchProduct, atCost?: boolean): number {
  return atCost ? p.cost : p.price;
}

/**
 * Order total in cents. Used by the page for display and independently by the
 * Worker for what it actually charges; both must agree, so both call this.
 */
export function orderTotal(lines: CartLine[], fulfilment: Fulfilment): {
  subtotal: number;
  delivery: number;
  total: number;
} {
  const subtotal = lines.reduce((sum, l) => {
    const p = findProduct(l.productId);
    if (!p) return sum;
    return sum + unitPrice(p, l.atCost) * l.qty;
  }, 0);

  const delivery =
    fulfilment === 'delivery' && subtotal > 0 && subtotal < FREE_DELIVERY_OVER
      ? DELIVERY_FEE
      : 0;

  return { subtotal, delivery, total: subtotal + delivery };
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
