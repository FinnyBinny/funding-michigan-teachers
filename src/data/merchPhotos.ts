/**
 * Real product photos for the shop.
 *
 * A photo is shown in place of the hand-drawn garment only when it pictures
 * the colorway the shopper has actually selected — pick navy and the drawing
 * comes back, because a photo of a black shirt is not a picture of a navy
 * one. The drawing recolors; a photograph cannot.
 *
 * Anything without an entry here (the sweatshirt, today) keeps its drawing,
 * which is why that is a working state rather than a gap: the doodles were
 * built to stand in indefinitely, not to be a placeholder with a deadline.
 *
 * If a file listed here is missing, the shop falls back to the drawing rather
 * than showing a broken image — see the onError handler in ShopPage.
 */

export interface MerchPhoto {
  /** Path under public/. */
  src: string;
  /** The colorway actually pictured, from MERCH_COLORS. */
  colorId: string;
  /** Intrinsic size, so the card reserves space before the photo loads. */
  width: number;
  height: number;
  alt: string;
}

export const MERCH_PHOTOS: Record<string, MerchPhoto> = {
  tee: {
    src: '/images/shop-tee.jpg',
    colorId: 'speckled-black',
    width: 1125,
    height: 1500,
    alt:
      'The FMT t-shirt in speckled black — a crayon-drawn schoolhouse, rainbow and three kids under the words Funding Michigan Teachers.',
  },
  hoodie: {
    src: '/images/shop-hoodie.jpg',
    colorId: 'white',
    width: 1069,
    height: 1426,
    alt:
      'The FMT hoodie in light heather, with the same crayon-drawn schoolhouse and rainbow across the chest.',
  },
};
