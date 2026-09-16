import type { ReactElement } from 'react';
import type { MerchColor } from '../../shared/merch';

/**
 * Hand-drawn garment illustrations, in the same ink-outline style as the
 * supply and campaign doodles.
 *
 * These stand in until real product photos exist, and they are deliberately
 * not fake photographs: a drawing reads honestly as "this is roughly what it
 * looks like", where a rendered mockup would read as a photo of a shirt
 * nobody has seen. Swap them for photos by replacing <GarmentArt> with an
 * <img> in ShopPage — the layout does not change.
 */

const INK = '#2b2b2b';
const SW = 2.2;

/** Flecks for the heather colorway. Fixed positions so it never reflows. */
const SPECKLES: [number, number, number][] = [
  [34, 40, 1.1], [45, 33, 0.8], [58, 44, 1.2], [40, 55, 0.9], [62, 60, 1],
  [36, 68, 1.1], [54, 72, 0.85], [66, 35, 0.9], [30, 52, 0.8], [50, 50, 1],
  [44, 78, 0.9], [60, 80, 1.05], [24, 36, 0.8], [72, 52, 0.9],
];

function Speckles({ clip }: { clip: string }) {
  return (
    <g clipPath={`url(#${clip})`} opacity={0.5}>
      {SPECKLES.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#d9d6d0" />
      ))}
    </g>
  );
}

const TEE_PATH =
  'M32 23 L15 31 L21 47 L33 41 L31 85 L69 85 L67 41 L79 47 L85 31 L68 23 C62 31 38 31 32 23 Z';

const CREW_PATH =
  'M33 24 L17 32 L13 63 L27 66 L28 86 L72 86 L73 66 L87 63 L83 32 L67 24 C61 32 39 32 33 24 Z';

const HOODIE_BODY =
  'M33 30 L17 38 L13 68 L27 71 L28 88 L72 88 L73 71 L87 68 L83 38 L67 30 Z';

interface ArtProps {
  color: MerchColor;
  className?: string;
}

export function TeeArt({ color, className }: ArtProps) {
  const id = `tee-${color.id}`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`T-shirt in ${color.name}`}>
      <defs>
        <clipPath id={id}><path d={TEE_PATH} /></clipPath>
      </defs>
      <path d={TEE_PATH} fill={color.hex} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {color.speckle && <Speckles clip={id} />}
      {/* collar */}
      <path d="M32 23 C38 31 62 31 68 23" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <path d="M34 26 C40 33 60 33 66 26" fill="none" stroke={INK} strokeWidth={1.3} opacity={0.5} strokeLinecap="round" />
      {/* chest mark, standing in for the FMT print */}
      <circle cx="50" cy="52" r="9" fill="none" stroke={color.light ? INK : '#f2efe9'} strokeWidth={1.8} opacity={0.75} />
      <path d="M45 52 L49 56 L56 48" fill="none" stroke={color.light ? INK : '#f2efe9'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </svg>
  );
}

export function SweatshirtArt({ color, className }: ArtProps) {
  const id = `crew-${color.id}`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Crewneck sweatshirt in ${color.name}`}>
      <defs>
        <clipPath id={id}><path d={CREW_PATH} /></clipPath>
      </defs>
      <path d={CREW_PATH} fill={color.hex} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {color.speckle && <Speckles clip={id} />}
      <path d="M33 24 C39 32 61 32 67 24" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* ribbed collar, cuffs and waistband */}
      <path d="M35 27 C40 34 60 34 65 27" fill="none" stroke={INK} strokeWidth={1.4} opacity={0.55} strokeLinecap="round" />
      <path d="M13 63 L27 66" stroke={INK} strokeWidth={1.4} opacity={0.55} strokeLinecap="round" />
      <path d="M87 63 L73 66" stroke={INK} strokeWidth={1.4} opacity={0.55} strokeLinecap="round" />
      <path d="M28 80 L72 80" stroke={INK} strokeWidth={1.4} opacity={0.55} strokeLinecap="round" />
      <circle cx="50" cy="52" r="9" fill="none" stroke={color.light ? INK : '#f2efe9'} strokeWidth={1.8} opacity={0.75} />
      <path d="M45 52 L49 56 L56 48" fill="none" stroke={color.light ? INK : '#f2efe9'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </svg>
  );
}

export function HoodieArt({ color, className }: ArtProps) {
  const id = `hood-${color.id}`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Hoodie in ${color.name}`}>
      <defs>
        <clipPath id={id}><path d={HOODIE_BODY} /></clipPath>
      </defs>
      {/* hood behind the shoulders */}
      <path
        d="M34 32 C33 15 67 15 66 32 C60 38 40 38 34 32 Z"
        fill={color.hex}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d={HOODIE_BODY} fill={color.hex} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {color.speckle && <Speckles clip={id} />}
      {/* neck opening */}
      <path d="M37 31 C42 38 58 38 63 31" fill="none" stroke={INK} strokeWidth={1.6} opacity={0.6} strokeLinecap="round" />
      {/* drawstrings */}
      <path d="M44 34 L43 46" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M56 34 L57 46" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="43" cy="47" r="1.4" fill={INK} />
      <circle cx="57" cy="47" r="1.4" fill={INK} />
      {/* kangaroo pocket */}
      <path d="M36 64 L64 64 L61 78 L39 78 Z" fill="none" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" opacity={0.7} />
      <circle cx="50" cy="55" r="6.5" fill="none" stroke={color.light ? INK : '#f2efe9'} strokeWidth={1.6} opacity={0.7} />
    </svg>
  );
}

export const GARMENT_ART: Record<string, (p: ArtProps) => ReactElement> = {
  tee: TeeArt,
  sweatshirt: SweatshirtArt,
  hoodie: HoodieArt,
};
