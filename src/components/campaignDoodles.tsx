/**
 * Campaign doodles for the "Your Cans. Their Classrooms." returnables page —
 * the smiling can, bottle, and dime from the printed door hanger.
 *
 * Drawn to the same recipe as supplyDoodles.tsx (48×48 viewBox, #2b2b2b
 * outlines at 2.4 weight, flat bright fills) so campaign art and school-supply
 * art can share a scene without one looking imported.
 */

const OUTLINE = '#2b2b2b';
const SW = 2.4;

const base = {
  stroke: OUTLINE,
  strokeWidth: SW,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Little smiling face shared by the can and the bottle. */
function Face({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <circle cx="-3.4" cy="-1.6" r="1" fill={OUTLINE} />
      <circle cx="3.4" cy="-1.6" r="1" fill={OUTLINE} />
      <path d="M-3.2 2c1 1.5 2 2.2 3.2 2.2S1.2 3.5 3.2 2" fill="none" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

/** Walking legs + waving arms, so the can and bottle look like they're marching. */
function Limbs({ y }: { y: number }) {
  return (
    <g stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" fill="none">
      <path d={`M14 ${y - 12}c-3 1.5-5 3-6 5.5`} />
      <path d={`M34 ${y - 14}c3 1 5 2.5 6.5 5`} />
      <path d={`M20 ${y}v4.5l-3 3`} />
      <path d={`M28 ${y}v4.5l3.5 3`} />
    </g>
  );
}

export function PopCan({ color = '#E8564A' }: { color?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="13" y="9" width="22" height="29" rx="4" fill={color} {...base} />
      {/* pull-tab lid */}
      <ellipse cx="24" cy="9.5" rx="11" ry="3" fill="#CFD8DC" {...base} />
      <ellipse cx="24" cy="9.2" rx="4.5" ry="1.4" fill="none" stroke={OUTLINE} strokeWidth="1.4" />
      {/* label band */}
      <path d="M13 21h22v6H13z" fill="#FFFDF6" stroke={OUTLINE} strokeWidth="1.6" />
      <Face cx={24} cy={17} />
      <Limbs y={38} />
    </svg>
  );
}

export function Bottle({ color = '#5EA9DD' }: { color?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* cap */}
      <rect x="20" y="4" width="8" height="4.5" rx="1.4" fill="#E8564A" {...base} />
      {/* neck into shoulders into body */}
      <path
        d="M21 8.5v3.5c0 1.6-4 3-4 7v15a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V19c0-4-4-5.4-4-7V8.5Z"
        fill={color}
        {...base}
      />
      {/* label */}
      <path d="M17 23h14v6H17z" fill="#FFFDF6" stroke={OUTLINE} strokeWidth="1.6" />
      <Face cx={24} cy={19} scale={0.85} />
      <Limbs y={38} />
    </svg>
  );
}

export function Dime() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="13" fill="#CFD8DC" {...base} />
      <circle cx="24" cy="24" r="9.5" fill="none" stroke={OUTLINE} strokeWidth="1.4" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={OUTLINE}
        fontFamily="Architects Daughter, cursive"
      >
        10¢
      </text>
    </svg>
  );
}

/** Hand-drawn schoolhouse the cans march toward. */
export function SchoolHouse() {
  return (
    <svg viewBox="0 0 64 56" fill="none" aria-hidden="true">
      {/* flag */}
      <path d="M32 4v7" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 4.5c3.5-.4 5 .6 7.5 1-2 1.6-4 2.6-7.5 2.4Z" fill="#5EA9DD" {...base} />
      {/* roof */}
      <path d="M8 26 32 11l24 15Z" fill="#E8564A" {...base} />
      {/* body */}
      <rect x="12" y="26" width="40" height="24" rx="2.5" fill="#FFD54F" {...base} />
      {/* door */}
      <path d="M27 50V36a5 5 0 0 1 10 0v14" fill="#4bbfb3" {...base} />
      {/* windows */}
      <rect x="16.5" y="32" width="7" height="7" rx="1.2" fill="#FFFDF6" {...base} />
      <rect x="40.5" y="32" width="7" height="7" rx="1.2" fill="#FFFDF6" {...base} />
      {/* bell window in the roof */}
      <circle cx="32" cy="20" r="3.2" fill="#FFFDF6" {...base} />
    </svg>
  );
}
