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
  /** Price in cents. This is what everyone pays — there is one price. */
  price: number;
  /**
   * What the item costs FMT to make, in cents. Nobody is ever charged this;
   * it exists only so the shop can say what an order sends to classrooms.
   * The t-shirt is exact: $5 DTF film from Swift Prints plus a ~$9 blank; the
   * sweatshirt and hoodie are still estimates, which now only shade a sentence
   * rather than set a price.
   */
  materialCost: number;
  blurb: string;
  /** Longer description shown when the product is selected. */
  detail: string;
}

export const MERCH: readonly MerchProduct[] = [
  {
    id: 'tee',
    name: 'FMT T-Shirt',
    price: 2500,
    materialCost: 1400, // exact: $5 film + $9 blank
    blurb: 'Soft cotton tee, pressed by hand.',
    detail:
      'The everyday one. DTF-printed by Swift Prints here in town, then heat-pressed by our students one shirt at a time.',
  },
  {
    id: 'sweatshirt',
    name: 'FMT Crewneck Sweatshirt',
    price: 4000,
    materialCost: 2500, // estimate
    blurb: 'Midweight crewneck for the staff room.',
    detail:
      'Warm enough for a cold classroom in February. Same hand-pressed print, same local shop.',
  },
  {
    id: 'hoodie',
    name: 'FMT Hoodie',
    price: 4500,
    materialCost: 3000, // estimate
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
    return sum + p.price * l.qty;
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
 *     TOM-OCT26:free-tee, OKEMOS26:free-tee
 *
 *   free-tee  — one t-shirt is free; everything else is charged normally
 *
 * There used to be a second kind, `educator`, which sold a whole order at our
 * material cost. That is gone — merch has one price now — and an old
 * `NAME:educator` entry is ignored rather than guessed at, so a stale variable
 * fails closed instead of silently discounting.
 *
 * Because an environment variable cannot count redemptions, a code is reusable
 * until it is changed. That is a deliberate trade: rotate the free-shirt code
 * each month (TOM-OCT26, TOM-NOV26) so a leak costs one month rather than a
 * season, and edit the variable to kill a code instantly with no deploy.
 */

export type CodeKind = 'free-tee';

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
      if (!code || kind !== 'free-tee') return null;
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
  'free-tee': 'One free t-shirt applied. Thank you for everything you do.',
};
