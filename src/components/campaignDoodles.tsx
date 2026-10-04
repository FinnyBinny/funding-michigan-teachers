import { useId } from 'react';

/**
 * Illustrations for the "Your Cans. Their Classrooms." returnables page.
 *
 * ── Why these were redrawn a second time ───────────────────────────────────
 * The first set gave every can a smiley face and stick legs. The second took
 * the faces away and drew wobbly crayon outlines — but at 19 to 44 pixels the
 * wobble was invisible, so they still read as flat clip-art icons. And the
 * composition was the real tell: a row of cute objects marching along a path
 * to a cartoon schoolhouse, bobbing up and down forever. That layout is what
 * generated illustration looks like, however carefully each icon is drawn.
 *
 * What replaces it is drawn the way a product illustrator would: objects at a
 * size where the craft shows, shaded as the shapes they are. A can is a metal
 * cylinder, so its color runs dark-light-dark across it with a specular
 * stripe, and its lid is brushed aluminium with a rim and a pull tab. A
 * returnable bottle is empty, so it is clear plastic with a tinted cap and a
 * label rather than a full bottle of colored liquid. A dime has a reeded edge.
 *
 * The one detail that makes them ours: "MI 10¢" on every container, which is
 * printed on every Michigan deposit can and bottle. No brands, no faces.
 */

/** Lighten (amt > 0) or darken (amt < 0) a hex color, -1..1. */
function shade(hex: string, amt: number): string {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? [...n].map((c) => c + c).join('') : n;
  const ch = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const out = ch.map((c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt));
  return `#${out.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

/** SVG gradient ids must be unique per instance and safe inside url(#…). */
function useSvgId(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/**
 * A 12oz aluminium can. viewBox is 64 wide by 128 tall, close to a real can's
 * proportions, so it should be sized by height.
 */
export function MetalCan({
  color = '#D9483B',
  className,
}: { color?: string; className?: string }) {
  const id = useSvgId('can');
  return (
    <svg viewBox="0 0 64 128" className={className} aria-hidden="true">
      <defs>
        {/* Across the cylinder: shadowed edge, the lit face, a hard specular
            stripe, then rolling off into the far edge. */}
        <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(color, -0.55)} />
          <stop offset="0.1" stopColor={shade(color, -0.22)} />
          <stop offset="0.26" stopColor={shade(color, 0.12)} />
          <stop offset="0.31" stopColor={shade(color, 0.55)} />
          <stop offset="0.36" stopColor={shade(color, 0.08)} />
          <stop offset="0.62" stopColor={color} />
          <stop offset="0.86" stopColor={shade(color, -0.3)} />
          <stop offset="1" stopColor={shade(color, -0.6)} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5d646b" />
          <stop offset="0.2" stopColor="#b8bec4" />
          <stop offset="0.33" stopColor="#f3f5f6" />
          <stop offset="0.5" stopColor="#aab1b7" />
          <stop offset="0.8" stopColor="#80878e" />
          <stop offset="1" stopColor="#535a61" />
        </linearGradient>
        <radialGradient id={`${id}-lid`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fbfcfc" />
          <stop offset="0.55" stopColor="#c3c9ce" />
          <stop offset="1" stopColor="#8d949a" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* Contact shadow on the surface it stands on. */}
      <ellipse cx="32" cy="121" rx="25" ry="3.6" fill="#2a1d10" opacity="0.22" filter={`url(#${id}-soft)`} />

      {/* Body, with the base curving under. */}
      <path d="M7 27 H57 V108 C57 113.5 53 116 47 116.5 H17 C11 116 7 113.5 7 108 Z" fill={`url(#${id}-body)`} />
      {/* The base's aluminium rim catching light. */}
      <path d="M8.5 110.5 C10 115 16 116.6 32 116.6 C48 116.6 54 115 55.5 110.5" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="2.4" />

      {/* Printed band and the Michigan deposit mark. */}
      <rect x="7" y="58" width="50" height="22" fill="#fffaf1" opacity="0.94" />
      <rect x="7" y="58" width="50" height="22" fill={`url(#${id}-body)`} opacity="0.16" />
      <text x="32" y="73.2" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="0.4"
            fill={shade(color, -0.35)} fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
        MI 10¢
      </text>

      {/* Shoulder: the neck tapers from the lid out to the body. */}
      <path d="M12.5 15.5 C12.5 21 7 22.5 7 27 H57 C57 22.5 51.5 21 51.5 15.5 Z" fill={`url(#${id}-metal)`} />

      {/* Lid: rim, recessed panel, pull tab. */}
      <ellipse cx="32" cy="15.5" rx="19.5" ry="4.8" fill={`url(#${id}-lid)`} stroke="#6f767c" strokeWidth="0.6" />
      <ellipse cx="32" cy="16" rx="16" ry="3.5" fill="#a7aeb4" />
      <ellipse cx="32" cy="15.6" rx="15.2" ry="3.1" fill={`url(#${id}-lid)`} />
      <path d="M27.4 15.4 c0-1.9 9.2-1.9 9.2 0 c0 1.6-2 2.3-4.6 2.3 s-4.6-.7-4.6-2.3 Z"
            fill="#d9dee2" stroke="#7d848a" strokeWidth="0.55" />
      <ellipse cx="32" cy="15.5" rx="1.6" ry="0.75" fill="#7d848a" />

      {/* A soft vertical sheen down the lit side, over the print. */}
      <rect x="17" y="28" width="3.2" height="84" fill="#ffffff" opacity="0.22" rx="1.6" />
    </svg>
  );
}

/**
 * An empty plastic returnable bottle. viewBox 56 x 140; size it by height.
 */
export function PlasticBottle({
  cap = '#2F7FC1',
  label = '#2F7FC1',
  className,
}: { cap?: string; label?: string; className?: string }) {
  const id = useSvgId('btl');
  const outline =
    'M21 22 V29 C21 33 9 37 9 50 V122 C9 129 13 132 20 132 H36 C43 132 47 129 47 122 V50 C47 37 35 33 35 29 V22 Z';
  return (
    <svg viewBox="0 0 56 140" className={className} aria-hidden="true">
      <defs>
        {/* Clear plastic: almost colorless, darker only at the edges where the
            wall is seen side-on, with a cool tint picked up from the cap. */}
        <linearGradient id={`${id}-plastic`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(cap, -0.35)} stopOpacity="0.55" />
          <stop offset="0.12" stopColor={shade(cap, 0.55)} stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="0.86" stopColor={shade(cap, 0.4)} stopOpacity="0.3" />
          <stop offset="1" stopColor={shade(cap, -0.4)} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(cap, -0.45)} />
          <stop offset="0.3" stopColor={shade(cap, 0.25)} />
          <stop offset="0.55" stopColor={cap} />
          <stop offset="1" stopColor={shade(cap, -0.5)} />
        </linearGradient>
        <linearGradient id={`${id}-label`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(label, -0.45)} />
          <stop offset="0.3" stopColor={shade(label, 0.18)} />
          <stop offset="0.6" stopColor={label} />
          <stop offset="1" stopColor={shade(label, -0.5)} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <ellipse cx="28" cy="134" rx="20" ry="3" fill="#2a1d10" opacity="0.2" filter={`url(#${id}-soft)`} />

      {/* Body: tint, then a crisp edge so it reads as a solid object. */}
      <path d={outline} fill="#eef5f8" opacity="0.55" />
      <path d={outline} fill={`url(#${id}-plastic)`} />
      <path d={outline} fill="none" stroke={shade(cap, -0.35)} strokeOpacity="0.45" strokeWidth="0.9" />

      {/* Molded grip rings above the base. */}
      {[106, 111, 116].map((y) => (
        <path key={y} d={`M9.6 ${y} C20 ${y + 1.6} 36 ${y + 1.6} 46.4 ${y}`} fill="none"
              stroke={shade(cap, -0.3)} strokeOpacity="0.28" strokeWidth="0.8" />
      ))}

      {/* Label with the deposit mark. */}
      <rect x="9" y="62" width="38" height="30" fill={`url(#${id}-label)`} />
      <rect x="9" y="62" width="38" height="2.2" fill="#ffffff" opacity="0.5" />
      <text x="28" y="80" textAnchor="middle" fontSize="7.6" fontWeight="800" letterSpacing="0.3"
            fill="#ffffff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
        MI 10¢
      </text>

      {/* Neck ring and the cap with its grip ridges. */}
      <rect x="18.5" y="20" width="19" height="3" rx="1" fill={`url(#${id}-cap)`} opacity="0.85" />
      <rect x="19.5" y="6" width="17" height="14" rx="2" fill={`url(#${id}-cap)`} />
      {[21.5, 24, 26.5, 29, 31.5, 34].map((x) => (
        <line key={x} x1={x} y1="7.2" x2={x} y2="18.8" stroke="#000" strokeOpacity="0.16" strokeWidth="0.7" />
      ))}

      {/* Long highlights down the lit side: what makes plastic read as clear. */}
      <path d="M14.5 52 C13.4 70 13.4 100 14.5 124" fill="none" stroke="#ffffff" strokeOpacity="0.85"
            strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18.2 40 C16.4 43 15.6 46 15.4 49" fill="none" stroke="#ffffff" strokeOpacity="0.75"
            strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** A dime, face-on. viewBox 40 x 40. */
export function Dime({ className }: { className?: string }) {
  const id = useSvgId('dime');
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-face`} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fdfdfd" />
          <stop offset="0.45" stopColor="#cdd2d6" />
          <stop offset="1" stopColor="#868d93" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="17.5" fill="#7a8187" />
      {/* Reeded edge: many fine ridges around the rim. */}
      <circle cx="20" cy="20" r="17" fill="none" stroke="#b6bcc1" strokeWidth="1.6" strokeDasharray="0.55 0.75" />
      <circle cx="20" cy="20" r="15.6" fill={`url(#${id}-face)`} />
      <circle cx="20" cy="20" r="13.2" fill="none" stroke="#9aa1a7" strokeWidth="0.6" />
      <text x="20" y="24.4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5d646b"
            fontFamily="'Fraunces', Georgia, serif">
        10¢
      </text>
    </svg>
  );
}

/**
 * The hero still life: two cans and a bottle grouped as one object, with a
 * couple of dimes, the way it would be photographed rather than lined up.
 * Sizes are in em so the whole arrangement scales from one font-size.
 */
export function ReturnablesStillLife({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: '15.5em', height: '11.6em' }} aria-hidden="true">
      <div className="absolute" style={{ left: '3em', bottom: '0.6em', height: '10.4em' }}>
        <PlasticBottle className="h-full w-auto" />
      </div>
      {/* Further back, so it stands a little higher on the table. */}
      <div className="absolute" style={{ left: '9.3em', bottom: '0.8em', height: '7.4em', zIndex: 1 }}>
        <MetalCan color="#2E9E93" className="h-full w-auto" />
      </div>
      <div className="absolute" style={{ left: '6.3em', bottom: '0.1em', height: '7.9em', zIndex: 2 }}>
        <MetalCan color="#D9483B" className="h-full w-auto" />
      </div>
      {/* Coins lying on the surface, seen at an angle. */}
      <div className="absolute" style={{ left: '1.3em', bottom: '0.05em', width: '2.1em', transform: 'scaleY(0.42) rotate(-8deg)', transformOrigin: 'bottom', zIndex: 3 }}>
        <Dime className="w-full h-auto" />
      </div>
      <div className="absolute" style={{ left: '12.2em', bottom: '0', width: '1.8em', transform: 'scaleY(0.42) rotate(12deg)', transformOrigin: 'bottom', zIndex: 3 }}>
        <Dime className="w-full h-auto" />
      </div>
    </div>
  );
}
