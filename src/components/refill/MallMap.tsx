import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { DoorOpen, Star } from 'lucide-react';
import type { RefillShop } from '../../../shared/refill';

/**
 * Main Street: the "walk around" part of the Mid-Year Refill store.
 *
 * Seven storefronts on two sides of a street, and a shopper who walks between
 * them. Three ways to get into a shop, so nobody is locked out by the novelty:
 *
 *   - arrow keys or WASD walk the shopper; Enter or Space goes in when they
 *     are at a door;
 *   - clicking or tapping a storefront walks the shopper there and opens it;
 *   - every storefront is a real <button>, so Tab and a screen reader reach
 *     each one with no walking at all. The map is decoration around a list of
 *     seven buttons, which is what it reads as.
 *
 * Positions are percentages of the map so the same layout holds from a phone
 * to a wide screen; the map keeps a fixed aspect ratio.
 */

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** Where each shop sits, and where its door is, as % of the map. */
interface Spot { x: number; y: number; w: number; h: number; doorX: number; doorY: number }

const STREET_Y = { top: 46, bottom: 60 };

/** Top row of four, bottom row of three: the street runs between them. */
const SPOTS: Spot[] = [
  { x: 2, y: 4, w: 22, h: 36, doorX: 13, doorY: 44 },
  { x: 27, y: 4, w: 22, h: 36, doorX: 38, doorY: 44 },
  { x: 52, y: 4, w: 22, h: 36, doorX: 63, doorY: 44 },
  { x: 77, y: 4, w: 21, h: 36, doorX: 87.5, doorY: 44 },
  { x: 10, y: 62, w: 24, h: 34, doorX: 22, doorY: 62 },
  { x: 38, y: 62, w: 24, h: 34, doorX: 50, doorY: 62 },
  { x: 66, y: 62, w: 24, h: 34, doorX: 78, doorY: 62 },
];

/** How close (in map %) the shopper must be to a door to go in. */
const DOOR_RANGE = 7;
/** Shopper speed when walking by keyboard, in map % per second. */
const SPEED = 42;
/**
 * Height over width of the map as drawn. Positions are percentages, so a
 * vertical step covers more screen than a horizontal one; distances scale
 * by this so "near a door" means the same thing on a wide map and a phone's
 * taller one. Measured from the element, with the desktop ratio as the start.
 */
const DEFAULT_ASPECT = 620 / 1000;

interface Pos { x: number; y: number }

function dist(a: Pos, b: Pos, aspect: number): number {
  const dx = a.x - b.x;
  const dy = (a.y - b.y) * aspect;
  return Math.hypot(dx, dy);
}

export interface MallMapProps {
  shops: readonly RefillShop[];
  /** Basket count per shop, for the badge over the door. */
  counts: Record<string, number>;
  /** Shops that still hold something on the shopper's list. */
  needed: ReadonlySet<string>;
  /** Called when the shopper goes into a shop. */
  onEnter: (shopId: string) => void;
  /** True while a shop is open, so keys do not walk the shopper behind it. */
  paused: boolean;
}

export default function MallMap({ shops, counts, needed, onEnter, paused }: MallMapProps) {
  const reduceMotion = useReducedMotion();
  const [pos, setPos] = useState<Pos>({ x: 30, y: 53 });
  /** 'walk' animates to a clicked door; 'key' moves frame by frame with no easing. */
  const [mode, setMode] = useState<'walk' | 'key'>('walk');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [heading, setHeading] = useState<string | null>(null);
  const keys = useRef(new Set<string>());
  const posRef = useRef(pos);
  posRef.current = pos;
  const mapRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);
  useEffect(() => {
    const el = mapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setAspect(height / width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spotOf = useCallback((shopId: string) => SPOTS[shops.findIndex((s) => s.id === shopId)], [shops]);

  /** The shop whose door the shopper is standing at, if any. */
  const nearby = useMemo(() => {
    let best: { id: string; d: number } | null = null;
    shops.forEach((s, i) => {
      const d = dist(pos, { x: SPOTS[i].doorX, y: SPOTS[i].doorY }, aspect);
      if (d <= DOOR_RANGE && (!best || d < best.d)) best = { id: s.id, d };
    });
    return best ? shops.find((s) => s.id === (best as { id: string }).id) ?? null : null;
  }, [pos, shops, aspect]);

  // ── Walking to a clicked storefront ──
  const walkTo = (shopId: string) => {
    const spot = spotOf(shopId);
    if (!spot) return;
    const target = { x: spot.doorX, y: spot.doorY };
    setFacing(target.x < posRef.current.x ? 'left' : 'right');
    if (reduceMotion || dist(posRef.current, target, aspect) < 1) {
      setPos(target);
      onEnter(shopId);
      return;
    }
    setMode('walk');
    setHeading(shopId);
    setPos(target);
  };

  const walkDuration = (from: Pos, to: Pos) => Math.min(1.6, Math.max(0.35, dist(from, to, aspect) / 55));
  const lastPos = useRef(pos);
  const duration = mode === 'walk' ? walkDuration(lastPos.current, pos) : 0;
  useEffect(() => { lastPos.current = pos; }, [pos]);

  // ── Keyboard walking ──
  useEffect(() => {
    if (paused) {
      keys.current.clear();
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    const KEYS: Record<string, Pos> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      a: { x: -1, y: 0 }, d: { x: 1, y: 0 }, w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
    };
    let frame = 0;
    let last = 0;
    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      let dx = 0;
      let dy = 0;
      for (const k of keys.current) {
        const v = KEYS[k];
        if (v) { dx += v.x; dy += v.y; }
      }
      if (dx || dy) {
        const len = Math.hypot(dx, dy) || 1;
        const p = posRef.current;
        const next = {
          x: Math.max(3, Math.min(97, p.x + (dx / len) * SPEED * dt)),
          // Vertical travel covers more of the map per unit, so it is scaled.
          y: Math.max(8, Math.min(94, p.y + (dy / len) * (SPEED / aspect) * dt)),
        };
        if (dx) setFacing(dx < 0 ? 'left' : 'right');
        setMode('key');
        setHeading(null);
        setPos(next);
      }
      frame = requestAnimationFrame(tick);
    };
    const down = (e: KeyboardEvent) => {
      // Only while the map itself (not a storefront button) has focus, so the
      // arrow keys keep their meaning in the rest of the page.
      if (document.activeElement !== map) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (KEYS[k]) {
        e.preventDefault();
        if (!keys.current.size) { last = 0; frame = requestAnimationFrame(tick); }
        keys.current.add(k);
      } else if ((e.key === 'Enter' || e.key === ' ') && nearby) {
        e.preventDefault();
        onEnter(nearby.id);
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      keys.current.delete(k);
      if (!keys.current.size) cancelAnimationFrame(frame);
    };
    const blur = () => { keys.current.clear(); cancelAnimationFrame(frame); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      cancelAnimationFrame(frame);
    };
  }, [paused, nearby, onEnter, aspect]);

  return (
    <div>
      <div
        ref={mapRef}
        tabIndex={0}
        role="group"
        aria-label="Main Street: seven supply shops. Use the arrow keys to walk, Enter to go in, or press a shop's button."
        className="relative w-full aspect-[1000/900] sm:aspect-[1000/620] rounded-[1.75rem] overflow-hidden ring-1 ring-chalkboard/[0.08] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)] bg-[#dfe9d6] outline-none focus-visible:ring-2 focus-visible:ring-ruler select-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0 6px, transparent 7px), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0 5px, transparent 6px)',
          backgroundSize: '160px 120px, 200px 150px',
        }}
      >
        {/* The street */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bg-[#5b5f65]"
          style={{ top: `${STREET_Y.top}%`, height: `${STREET_Y.bottom - STREET_Y.top}%` }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-[repeating-linear-gradient(90deg,#eebc5e_0_28px,transparent_28px_52px)] opacity-90" />
          <div className="absolute inset-x-0 top-0 h-[7%] bg-white/50" />
          <div className="absolute inset-x-0 bottom-0 h-[7%] bg-white/50" />
        </div>
        {/* Sidewalks */}
        <div aria-hidden="true" className="absolute inset-x-0 bg-[#cfcac0]" style={{ top: `${STREET_Y.top - 4}%`, height: '4%' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bg-[#cfcac0]" style={{ top: `${STREET_Y.bottom}%`, height: '4%' }} />

        {/* Storefronts */}
        {shops.map((shop, i) => {
          const spot = SPOTS[i];
          const count = counts[shop.id] ?? 0;
          const onList = needed.has(shop.id);
          const isNear = nearby?.id === shop.id;
          const top = i < 4;
          return (
            <button
              key={shop.id}
              type="button"
              onClick={() => walkTo(shop.id)}
              aria-label={`${shop.name}: ${shop.tagline}${count ? `. ${count} in your basket` : ''}${onList ? '. Something on your list is here' : ''}`}
              className={`absolute group text-left rounded-xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ruler/60 ${isNear ? 'scale-[1.02]' : ''}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: `${spot.h}%` }}
            >
              <Storefront shop={shop} count={count} onList={onList} near={isNear} doorAtBottom={top} />
            </button>
          );
        })}

        {/* The shopper */}
        <motion.div
          aria-hidden="true"
          className="absolute z-20 w-[6%] min-w-[26px] max-w-[46px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          transition={mode === 'walk' && !reduceMotion ? { duration, ease: EASE } : { duration: 0 }}
          onAnimationComplete={() => {
            if (heading) {
              const id = heading;
              setHeading(null);
              onEnter(id);
            }
          }}
        >
          <Shopper facing={facing} walking={mode === 'walk' && heading !== null} />
        </motion.div>

        {/* "Go in" prompt */}
        {nearby && !paused && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="absolute z-30 -translate-x-1/2 pointer-events-none"
            // Under the shopper at a top-row door, over their head at a
            // bottom-row one, so it never sits on the sign they are reading.
            style={{ left: `${pos.x}%`, top: `${pos.y + (shops.findIndex((s) => s.id === nearby.id) < 4 ? 7 : -12)}%` }}
          >
            <button
              type="button"
              onClick={() => onEnter(nearby.id)}
              className="pointer-events-auto bg-chalkboard text-white text-[0.625rem] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5"
            >
              <DoorOpen size={12} aria-hidden="true" /> Go into {nearby.name}
            </button>
          </motion.div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {nearby ? `You are outside ${nearby.name}. Press Enter to go in.` : ''}
      </p>
      <p className="text-xs text-chalkboard/70 mt-3 text-center leading-relaxed">
        Tap a shop to walk there. On a keyboard, click the street, then use the arrow keys and press Enter at a door.
      </p>
    </div>
  );
}

/** One building: awning, sign, window, door. Pure decoration inside a button. */
function Storefront({ shop, count, onList, near, doorAtBottom }: {
  shop: RefillShop; count: number; onList: boolean; near: boolean; doorAtBottom: boolean;
}) {
  const wall = `hsl(${shop.hue} 55% 90%)`;
  const trim = `hsl(${shop.hue} 45% 38%)`;
  const awning = `repeating-linear-gradient(90deg, hsl(${shop.hue} 60% 55%) 0 12px, #fff 12px 24px)`;
  return (
    <span
      className={`block w-full h-full rounded-xl overflow-hidden ring-1 shadow-[0_8px_20px_rgba(0,0,0,0.08)] relative ${near ? 'ring-2 ring-chalkboard' : 'ring-chalkboard/15'}`}
      style={{ background: wall }}
    >
      {/* Roofline / awning: on the street side of the building. */}
      <span
        className={`absolute inset-x-0 h-[14%] ${doorAtBottom ? 'bottom-0' : 'top-0'}`}
        style={{ background: awning }}
      />
      {/* Sign */}
      <span
        className={`absolute inset-x-[8%] ${doorAtBottom ? 'top-[12%]' : 'top-[24%]'} bg-white/90 rounded-md px-1.5 py-1 text-center ring-1 shadow-sm`}
        style={{ borderColor: trim }}
      >
        <span className="block font-hand text-[clamp(0.6rem,1.4vw,1rem)] leading-tight text-chalkboard" style={{ color: trim }}>
          {shop.name}
        </span>
      </span>
      {/* Window + door */}
      <span
        className={`absolute ${doorAtBottom ? 'bottom-[16%]' : 'top-[52%]'} left-[12%] w-[36%] h-[26%] rounded-sm bg-[#a8c5e0]/80 ring-1`}
        style={{ borderColor: trim, boxShadow: `inset 0 0 0 2px ${trim}` }}
      />
      <span
        className={`absolute ${doorAtBottom ? 'bottom-[14%]' : 'top-[50%]'} right-[14%] w-[22%] h-[30%] rounded-t-md`}
        style={{ background: trim }}
      >
        <span className="absolute right-[18%] top-1/2 w-1.5 h-1.5 rounded-full bg-pencil" />
      </span>
      {/* Badges */}
      {count > 0 && (
        <span className={`absolute ${doorAtBottom ? 'bottom-1.5' : 'top-1.5'} right-1.5 bg-apple text-white text-[0.625rem] font-bold min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center tabular-nums shadow`}>
          {count}
        </span>
      )}
      {onList && (
        <span className={`absolute ${doorAtBottom ? 'bottom-1.5' : 'top-1.5'} left-1.5 bg-pencil text-chalkboard text-[0.5625rem] font-bold uppercase tracking-wider px-1.5 h-5 rounded-full flex items-center gap-1 shadow`}>
          <Star size={9} strokeWidth={3} aria-hidden="true" /> List
        </span>
      )}
    </span>
  );
}

/** The shopper: a round face, an FMT-red scarf and a basket. */
function Shopper({ facing, walking }: { facing: 'left' | 'right'; walking: boolean }) {
  return (
    <motion.div
      className="w-full"
      style={{ transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
      animate={walking ? { y: [0, -2, 0] } : { y: 0 }}
      transition={walking ? { duration: 0.35, repeat: Infinity } : { duration: 0.2 }}
    >
      <svg viewBox="0 0 40 46" className="w-full h-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]" aria-hidden="true">
        <ellipse cx="20" cy="43" rx="11" ry="2.5" fill="rgba(0,0,0,0.18)" />
        <rect x="11" y="22" width="18" height="16" rx="6" fill="#1f5673" />
        <circle cx="20" cy="13" r="10" fill="#f4e1c8" />
        <path d="M10 11 Q20 0 30 11 Q25 7 20 8 Q15 7 10 11Z" fill="#46494e" />
        <circle cx="16.5" cy="13" r="1.3" fill="#1a1c1d" />
        <circle cx="23.5" cy="13" r="1.3" fill="#1a1c1d" />
        <path d="M16.5 17 Q20 20 23.5 17" stroke="#1a1c1d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <rect x="11" y="22" width="18" height="4" fill="#c0392b" />
        <path d="M28 28 h9 l-1.5 8 h-6z" fill="#eebc5e" stroke="#8a6420" strokeWidth="1" />
        <path d="M30 28 q2.5 -5 5 0" stroke="#8a6420" strokeWidth="1.2" fill="none" />
      </svg>
    </motion.div>
  );
}
