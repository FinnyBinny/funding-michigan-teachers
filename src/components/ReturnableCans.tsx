import { motion, useReducedMotion } from 'motion/react';

/**
 * A small row of crushed cans and pop bottles: an accent under the hero, not
 * the main event.
 *
 * Unbranded on purpose: no logos, only the Michigan "MI 10¢" deposit mark
 * real returnables carry. Each piece is a 3D model of a real container — a
 * 12 oz can, a 16 oz tall can, a slim 8.4 oz can, a 7.5 oz mini can, a 20 oz
 * pop bottle — crushed, then finished to look painted and inked
 * (scripts/returnables-art/). The bottles are pop rather than water because
 * Michigan's deposit covers carbonated drinks, not still water.
 *
 * ── Sizing ──────────────────────────────────────────────────────────────────
 * Every image is drawn at the same scale, 2 pixels per millimetre, and shown
 * at one shared scale (--s). So the sizes vary the way real ones do — a tall
 * can is tall, a mini is small — and never because one was sized by hand.
 * Each file is trimmed to the drawing, with no padding, so the gaps you see
 * are the gaps set here.
 *
 * ── Crispness ───────────────────────────────────────────────────────────────
 * --s stays under 1/2 on desktop (2x screens) and under 1/3 on phones (3x
 * screens), so the browser only ever scales these DOWN.
 */
const ITEMS = [
  // file, native size, hidden on phones
  { file: 'bottle-green', w: 160, h: 402, phoneHidden: true },
  { file: 'can-tall-orange', w: 153, h: 318, phoneHidden: false },
  { file: 'can-red', w: 145, h: 202, phoneHidden: false },
  { file: 'can-mini-lime', w: 126, h: 205, phoneHidden: false },
  { file: 'can-slim-dark', w: 122, h: 259, phoneHidden: false },
  { file: 'can-blue', w: 148, h: 211, phoneHidden: false },
  { file: 'can-silver', w: 142, h: 182, phoneHidden: true },
  { file: 'bottle-clear', w: 148, h: 392, phoneHidden: false },
] as const;

type Item = (typeof ITEMS)[number];

function Returnable({ item, lazy = false, className = '' }: { item: Item; lazy?: boolean; className?: string }) {
  return (
    <picture className="block">
      <source type="image/avif" srcSet={`/images/returnables/${item.file}.avif`} />
      <img
        src={`/images/returnables/${item.file}.webp`}
        alt=""
        width={item.w}
        height={item.h}
        loading={lazy ? 'lazy' : undefined}
        decoding="async"
        className={`block w-auto ${className}`}
        style={{ height: `calc(${item.h}px * var(--s))` }}
      />
    </picture>
  );
}

/** The hero accent: a short, evenly spaced row on one ground line. */
export function ReturnableCansRow({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`flex items-end justify-center gap-3 sm:gap-7 [--s:0.26] sm:[--s:0.35] ${className}`}
      aria-hidden="true"
    >
      {ITEMS.map((item, i) => (
        <motion.div
          key={item.file}
          className={item.phoneHidden ? 'hidden sm:block' : 'block'}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.06, ease: [0.32, 0.72, 0, 1] }}
        >
          <Returnable item={item} className="drop-shadow-[0_6px_6px_rgba(45,28,12,0.18)]" />
        </motion.div>
      ))}
    </div>
  );
}

/** Three for tighter spots, e.g. inside a card. */
export function ReturnableCansTrio({ className = '' }: { className?: string }) {
  const trio = [ITEMS[2], ITEMS[7], ITEMS[5]];
  return (
    <div className={`flex items-end justify-center gap-4 [--s:0.2] sm:[--s:0.24] ${className}`} aria-hidden="true">
      {trio.map((item) => (
        <Returnable key={item.file} item={item} lazy className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]" />
      ))}
    </div>
  );
}
