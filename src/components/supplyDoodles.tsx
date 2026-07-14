/**
 * Hand-drawn "classroom doodle" school supplies — bold dark outlines with
 * bright flat fills, matching the sticker-sheet reference art the founder
 * picked. Inline SVGs so they stay crisp at any size and ship with zero
 * asset requests. Used by the donate page's falling-supplies basket.
 */

const OUTLINE = '#2b2b2b';
const SW = 2.4;

const base = {
  stroke: OUTLINE,
  strokeWidth: SW,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Pencil() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(38 24 24)">
        <rect x="19" y="4" width="10" height="5" rx="1.5" fill="#F9A1BC" {...base} />
        <rect x="19" y="9" width="10" height="3.5" fill="#9FB4C7" {...base} />
        <rect x="19" y="12.5" width="10" height="20" fill="#FFCA3A" {...base} />
        <path d="M19 32.5h10L24 43.5Z" fill="#F2C083" {...base} />
        <path d="M22.2 38.6 24 43.5l1.8-4.9Z" fill={OUTLINE} stroke={OUTLINE} strokeWidth="1" />
        <line x1="24" y1="13" x2="24" y2="31" stroke="#E8A917" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

function Apple() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 14c2-3 7.5-4 10.8-1.2 4.2 3.5 4.6 10.6 1.5 16.9C33.7 35 30 39 26.8 38c-1.1-.4-1.8-.8-2.8-.8s-1.7.4-2.8.8C18 39 14.3 35 11.7 29.7c-3.1-6.3-2.7-13.4 1.5-16.9C16.5 10 22 11 24 14Z"
        fill="#E84B3C" {...base}
      />
      <path d="M24 13.5c.2-3 1.4-5 3.6-6.5" fill="none" {...base} />
      <path d="M27.6 7c3.4-.6 5.8.6 7 3-3 1.2-5.6.5-7-3Z" fill="#7BC067" {...base} />
      <path d="M16 19c-1.4 2-1.9 4.2-1.5 6.6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function OpenBook() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 13c-4.5-3.4-10.6-4-16-2v25c5.4-2 11.5-1.4 16 2 4.5-3.4 10.6-4 16-2V11c-5.4-2-11.5-1.4-16 2Z" fill="#5EA9DD" {...base} />
      <path d="M24 14.5c-3.8-2.8-8.8-3.4-13.2-1.9v21.2c4.4-1.5 9.4-.9 13.2 1.9 3.8-2.8 8.8-3.4 13.2-1.9V12.6c-4.4-1.5-9.4-.9-13.2 1.9Z" fill="#FFFDF6" {...base} />
      <path d="M24 14.5v21.2" {...base} />
      <path d="M14 18.5c2.6-.5 5.2-.3 7.4.7M14 23c2.6-.5 5.2-.3 7.4.7M14 27.5c2.6-.5 5.2-.3 7.4.7M26.6 19.2c2.2-1 4.8-1.2 7.4-.7M26.6 23.7c2.2-1 4.8-1.2 7.4-.7M26.6 28.2c2.2-1 4.8-1.2 7.4-.7" stroke="#9db3c8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Notebook() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="7" width="28" height="34" rx="3" fill="#F27059" {...base} />
      <rect x="16" y="19" width="16" height="12" rx="1.5" fill="#FFFDF6" {...base} />
      <path d="M18.5 23.5h11M18.5 27h7" stroke="#9db3c8" strokeWidth="1.6" strokeLinecap="round" />
      {[12, 17.7, 23.4, 29.1, 34.8].map((y) => (
        <circle key={y} cx="10" cy={y} r="2.6" fill="#FFFDF6" {...base} />
      ))}
    </svg>
  );
}

function GlueStick() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(-14 24 24)">
        <rect x="17" y="6" width="14" height="9" rx="2.5" fill="#8E7CC3" {...base} />
        <rect x="15.5" y="15" width="17" height="26" rx="3" fill="#B4A7D6" {...base} />
        <rect x="15.5" y="22" width="17" height="10" fill="#FFFDF6" {...base} />
        <path d="M19 25.5h10" stroke="#8E7CC3" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Ruler() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(45 24 24)">
        <rect x="17.5" y="3" width="13" height="42" rx="2" fill="#FFD54F" {...base} />
        {[9, 15, 21, 27, 33, 39].map((y, i) => (
          <line key={y} x1="17.5" y1={y} x2={i % 2 ? 23 : 25.5} y2={y} stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
        ))}
      </g>
    </svg>
  );
}

function Backpack() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M18 12c0-3.6 2.6-6 6-6s6 2.4 6 6" fill="none" {...base} />
      <path d="M10 22c0-6 6.3-9.5 14-9.5S38 16 38 22v14a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5V22Z" fill="#E8564A" {...base} />
      <path d="M14 15.5V38M34 15.5V38" stroke={OUTLINE} strokeWidth="1.8" />
      <rect x="16.5" y="24" width="15" height="13" rx="3.5" fill="#5EA9DD" {...base} />
      <rect x="20.5" y="21" width="7" height="6" rx="2" fill="#FFD54F" {...base} />
      <path d="M20.5 30.5h7" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GradCap() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 10 44 19l-20 9L4 19Z" fill="#EBB94E" {...base} />
      <path d="M13 23.5v8c0 2.8 4.9 5 11 5s11-2.2 11-5v-8" fill="#EBB94E" {...base} />
      <path d="M40 20.5v9" {...base} />
      <circle cx="40" cy="32" r="2.4" fill="#E84B3C" {...base} />
    </svg>
  );
}

function Scissors() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(14 24 26)">
        <rect x="21.6" y="5.5" width="4.8" height="21" rx="2.4" fill="#CFD8DC" {...base} transform="rotate(-16 24 26)" />
        <rect x="21.6" y="5.5" width="4.8" height="21" rx="2.4" fill="#B8C4CB" {...base} transform="rotate(16 24 26)" />
        <circle cx="24" cy="26" r="2.4" fill="#FFD54F" {...base} />
        <circle cx="18.2" cy="35.5" r="5" fill="none" stroke="#E8564A" strokeWidth="4.2" />
        <circle cx="29.8" cy="35.5" r="5" fill="none" stroke="#E8564A" strokeWidth="4.2" />
        <circle cx="18.2" cy="35.5" r="5" fill="none" stroke={OUTLINE} strokeWidth="1.4" />
        <circle cx="29.8" cy="35.5" r="5" fill="none" stroke={OUTLINE} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function Crayon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(-24 24 24)">
        <path d="M24 4.5 28.5 13h-9Z" fill="#F4772E" {...base} />
        <rect x="19.5" y="13" width="9" height="29" rx="2.5" fill="#F4772E" {...base} />
        <rect x="19.5" y="18.5" width="9" height="12" fill="#3C6E9F" {...base} />
        <path d="M22 22.5h4M22 26h4" stroke="#FFFDF6" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Eraser() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(-14 24 24)">
        <rect x="8" y="16" width="32" height="16" rx="4" fill="#F48FB1" {...base} />
        <path d="M8 25h32v3a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z" fill="#5EA9DD" {...base} />
        <path d="M14 20.5h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Calculator() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="11" y="6" width="26" height="36" rx="4" fill="#5EA9DD" {...base} />
      <rect x="15.5" y="11" width="17" height="8" rx="1.8" fill="#FFFDF6" {...base} />
      {[
        [19, 25], [28, 25],
        [19, 31.5], [28, 31.5],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 2.6} y={y - 2.2} width="5.2" height="4.4" rx="1.4" fill="#FFFDF6" {...base} />
      ))}
      <rect x="16.4" y="35.3" width="14.2" height="4.4" rx="1.4" fill="#FFD54F" {...base} />
    </svg>
  );
}

function PaintBrush() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(34 24 24)">
        <rect x="20.8" y="4" width="6.4" height="18" rx="2.6" fill="#D9A05B" {...base} />
        <rect x="20" y="21.5" width="8" height="6" rx="1.4" fill="#9FB4C7" {...base} />
        <path d="M20 27.5h8c.4 5.2-1 10.5-4 14.5-3-4-4.4-9.3-4-14.5Z" fill="#E84B3C" {...base} />
      </g>
    </svg>
  );
}

export interface SupplyDoodle {
  key: string;
  Art: () => React.JSX.Element;
  /** rendered square size in px — slight variety keeps the pile organic */
  px: number;
}

// Rotation order matters: early chips (small gifts) are the classics; the
// backpack lands once the pile is a handful deep.
export const SUPPLY_DOODLES: SupplyDoodle[] = [
  { key: 'pencil',    Art: Pencil,     px: 40 },
  { key: 'apple',     Art: Apple,      px: 40 },
  { key: 'notebook',  Art: Notebook,   px: 40 },
  { key: 'crayon',    Art: Crayon,     px: 38 },
  { key: 'book',      Art: OpenBook,   px: 44 },
  { key: 'glue',      Art: GlueStick,  px: 36 },
  { key: 'backpack',  Art: Backpack,   px: 48 },
  { key: 'ruler',     Art: Ruler,      px: 40 },
  { key: 'eraser',    Art: Eraser,     px: 36 },
  { key: 'calculator', Art: Calculator, px: 42 },
  { key: 'gradcap',   Art: GradCap,    px: 44 },
  { key: 'scissors',  Art: Scissors,   px: 40 },
  { key: 'brush',     Art: PaintBrush, px: 40 },
];
