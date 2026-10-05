import { motion, useReducedMotion } from 'motion/react';

/**
 * Real crushed cans for the returnables page, used with the artist's
 * permission. Cut out of the original painting onto transparent WebP at full
 * native resolution (public/images/returnables/).
 *
 * Only non-alcoholic cans are used. Michigan's deposit covers beer too, but
 * FMT is a student-led organisation working inside schools, and the original
 * set's beer cans stay off the site.
 *
 * ── Crispness ───────────────────────────────────────────────────────────────
 * A raster image only stays sharp if it is never shown larger than its native
 * pixels divided by the screen's density. Each can's display heights below
 * are kept under native/2 on desktop (2x screens) and native/3 on phones (3x
 * screens), so the browser only ever scales these DOWN. Raising a height past
 * that limit is what would make them blurry.
 */
const CANS = [
  // file, native size, display height desktop / phone, tilt, hidden on phones
  { file: 'fanta', w: 254, h: 428, desk: 166, phone: 96, tilt: -7, phoneHidden: false },
  { file: 'diet-coke', w: 278, h: 448, desk: 176, phone: 102, tilt: 5, phoneHidden: false },
  { file: 'red-bull', w: 167, h: 414, desk: 190, phone: 104, tilt: -3, phoneHidden: true },
  { file: 'coca-cola', w: 347, h: 458, desk: 186, phone: 108, tilt: -4, phoneHidden: false },
  { file: 'sprite', w: 283, h: 422, desk: 170, phone: 98, tilt: 6, phoneHidden: false },
  { file: 'pepsi', w: 253, h: 413, desk: 174, phone: 100, tilt: -5, phoneHidden: false },
  { file: '7up', w: 207, h: 303, desk: 124, phone: 74, tilt: 9, phoneHidden: true },
] as const;

/** The hero row: cans standing on one ground line, slightly overlapping. */
export function ReturnableCansRow({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={`flex items-end justify-center ${className}`} aria-hidden="true">
      {CANS.map((can, i) => (
        <motion.img
          key={can.file}
          src={`/images/returnables/${can.file}.webp`}
          alt=""
          width={can.w}
          height={can.h}
          decoding="async"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: [0.32, 0.72, 0, 1] }}
          className={`${can.phoneHidden ? 'hidden sm:block' : 'block'} w-auto h-[var(--phone)] sm:h-[var(--desk)] -mx-1.5 sm:-mx-2.5 drop-shadow-[0_10px_10px_rgba(45,28,12,0.22)]`}
          style={{
            '--desk': `${can.desk}px`,
            '--phone': `${can.phone}px`,
            rotate: `${can.tilt}deg`,
            zIndex: i % 2 ? 2 : 1,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/** A small trio for tighter spots, e.g. inside a card. Heights stay well under native/3. */
export function ReturnableCansTrio({ className = '' }: { className?: string }) {
  const trio = [CANS[3], CANS[4], CANS[1]];
  return (
    <div className={`flex items-end justify-center gap-1 ${className}`} aria-hidden="true">
      {trio.map((can, i) => (
        <img
          key={can.file}
          src={`/images/returnables/${can.file}.webp`}
          alt=""
          width={can.w}
          height={can.h}
          loading="lazy"
          decoding="async"
          className="w-auto h-16 sm:h-20 drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)]"
          style={{ rotate: `${[-6, 4, 7][i]}deg` }}
        />
      ))}
    </div>
  );
}
