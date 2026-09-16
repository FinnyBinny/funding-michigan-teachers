/**
 * Real product photos for the shop.
 *
 * A photo is shown in place of the hand-drawn garment only when it pictures
 * the colorway the shopper has actually selected — pick navy and the drawing
 * comes back, because a photo of a black shirt is not a picture of a navy
 * one. The drawing recolors; a photograph cannot.
 *
 * Anything without an entry here keeps its drawing, and so does any colorway
 * we have not shot. That is a working state rather than a gap: the doodles
 * were built to stand in indefinitely, not to be placeholders with a
 * deadline. Two of three colorways are drawings today.
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
    width: 800,
    height: 1000,
    alt:
      'The FMT t-shirt in speckled black — a crayon-drawn schoolhouse, rainbow and three kids under the words Funding Michigan Teachers.',
  },
  sweatshirt: {
    src: '/images/shop-sweatshirt.jpg',
    colorId: 'white',
    width: 800,
    height: 1000,
    alt:
      'The FMT crewneck sweatshirt in white, the crayon-drawn schoolhouse and rainbow printed large across the chest.',
  },
  hoodie: {
    src: '/images/shop-hoodie.jpg',
    colorId: 'white',
    width: 800,
    height: 1000,
    alt:
      'The FMT hoodie in white, with the same crayon-drawn schoolhouse and rainbow across the chest.',
  },
};
