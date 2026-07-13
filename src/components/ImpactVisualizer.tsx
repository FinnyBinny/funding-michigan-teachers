import { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { SUPPLY_DOODLES } from './supplyDoodles';
import {
  Pencil, NotebookPen, Paintbrush, BookOpen, UtensilsCrossed,
  FlaskConical, GraduationCap, Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/**
 * Real-world school-supply equivalences (approximate retail, bulk pricing).
 * These power the "what your gift actually becomes" cards. Keep prices
 * honest — the point is credibility, not inflation.
 */
const ITEMS = [
  { key: 'pencils',  unit: 0.10, singular: 'pencil',            plural: 'pencils',            icon: Pencil,        accent: 'pencil' as const },
  { key: 'glue',     unit: 0.60, singular: 'glue stick',        plural: 'glue sticks',        icon: Paintbrush,    accent: 'ruler'  as const },
  { key: 'notebook', unit: 1.25, singular: 'spiral notebook',   plural: 'spiral notebooks',   icon: NotebookPen,   accent: 'apple'  as const },
  { key: 'book',     unit: 6.00, singular: 'classroom book',    plural: 'classroom books',    icon: BookOpen,      accent: 'ruler'  as const },
  { key: 'meal',     unit: 8.00, singular: 'teacher fed at a staff meeting', plural: 'teachers fed at a staff meeting', icon: UtensilsCrossed, accent: 'apple' as const },
  { key: 'lab',      unit: 45.0, singular: 'science lab kit',   plural: 'science lab kits',   icon: FlaskConical,  accent: 'pencil' as const },
];

const GRANT_SIZE = 250; // one full classroom grant

const ACCENTS = {
  pencil: { bg: 'bg-pencil/15', text: 'text-pencil-dark', ring: 'ring-pencil/30' },
  apple:  { bg: 'bg-apple/10',  text: 'text-apple',       ring: 'ring-apple/20' },
  ruler:  { bg: 'bg-ruler/10',  text: 'text-ruler',       ring: 'ring-ruler/20' },
};

/** Spring-animated number — counts smoothly toward its target on every change. */
function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString() }: {
  value: number;
  format?: (n: number) => string;
}) {
  const spring = useSpring(value, { damping: 26, stiffness: 140, mass: 0.8 });
  const display = useTransform(spring, format);
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
}

/**
 * One supply drops into the basket per ~$25, capped at 12 so the basket
 * reads "full" rather than turning into confetti. Cycles through the doodle
 * set (backpack lands around the 7th item, ~$150); rotation is derived from
 * the index so the pile looks organic but renders identically every time
 * (no Math.random — keeps re-renders stable).
 */
function buildChips(amount: number) {
  const count = Math.min(12, Math.max(1, Math.ceil(amount / 25)));
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    doodle: SUPPLY_DOODLES[i % SUPPLY_DOODLES.length],
    rotate: ((i * 47) % 21) - 10,
  }));
}

/** Pick the 3 most compelling equivalences for a given amount. */
function pickEquivalences(amount: number) {
  const scored = ITEMS
    .map((item) => ({ item, count: Math.floor(amount / item.unit) }))
    .filter(({ count }) => count >= 1)
    .map((e) => ({
      ...e,
      // Prefer counts that read well: 3–400 is the sweet spot. Pencils get a
      // bonus because a big pencil pile is the signature visual.
      score:
        (e.count >= 3 && e.count <= 400 ? 2 : e.count <= 2000 ? 1 : 0) +
        (e.item.key === 'pencils' ? 1.5 : 0) +
        (e.item.key === 'meal' && e.count >= 2 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

interface ImpactVisualizerProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  frequency?: 'monthly' | 'once';
}

export default function ImpactVisualizer({ amount, onAmountChange, frequency = 'monthly' }: ImpactVisualizerProps) {
  const equivalences = useMemo(() => pickEquivalences(amount), [amount]);
  const chips = useMemo(() => buildChips(amount), [amount]);
  const grantPct = Math.min((amount / GRANT_SIZE) * 100, 100);
  const reduceMotion = useReducedMotion();

  // Chip count from the previous render, so freshly-added supplies get a
  // staggered "raining in" delay while existing ones stay put.
  const prevCountRef = useRef(0);
  const prevCount = prevCountRef.current;
  useEffect(() => { prevCountRef.current = chips.length; }, [chips.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
    >
      {/* Double-bezel shell */}
      <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/10 rounded-[2.5rem] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">

            {/* LEFT — the dial */}
            <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-paper/40 border-b lg:border-b-0 lg:border-r border-chalkboard/5">
              <div className="inline-flex items-center gap-2 w-fit bg-apple/10 text-apple ring-1 ring-apple/20 px-3 py-1 rounded-full text-[10px] font-bold mb-7 uppercase tracking-[0.24em]">
                <Sparkles size={11} strokeWidth={1.5} />
                See your impact
              </div>

              {/* Big animated dollar readout */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-serif font-bold text-chalkboard/30 text-3xl md:text-4xl">$</span>
                <span className="font-serif font-bold text-chalkboard leading-none text-[clamp(3.5rem,7vw,5.5rem)] tracking-[-0.03em] tabular-nums">
                  <AnimatedNumber value={amount} />
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-chalkboard/40 mb-2">
                  {frequency === 'monthly' ? '/ month' : 'one-time'}
                </span>
              </div>
              <p className="font-hand text-lg text-chalkboard/45 mb-8 -rotate-1">…turns into real things, fast</p>

              {/* Slider */}
              <input
                type="range"
                min={1}
                max={300}
                step={1}
                value={Math.min(amount, 300)}
                onChange={(e) => onAmountChange(Number(e.target.value))}
                aria-label="Donation amount"
                className="impact-slider w-full"
              />
              <div className="flex justify-between mt-2 text-[10px] uppercase tracking-[0.18em] font-bold text-chalkboard/30">
                <span>$1</span>
                <span>$150</span>
                <span>$300+</span>
              </div>

              {/* The supply basket — fills with chips as the slider moves */}
              <div className="mt-8 pt-6 border-t border-chalkboard/8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/45">
                    Your supply basket
                  </span>
                  <span className="font-hand text-sm text-chalkboard/40 -rotate-1">
                    {amount >= GRANT_SIZE ? 'overflowing!' : amount >= 100 ? 'filling up fast' : 'slide to fill it…'}
                  </span>
                </div>
                <div
                  className="relative rounded-t-xl rounded-b-[1.75rem] ring-1 ring-pencil-dark/25 bg-gradient-to-b from-pencil/5 to-pencil/20 px-4 pt-4 pb-3"
                  style={{ backgroundImage: 'repeating-linear-gradient(-45deg, rgba(60,40,10,0.03) 0 8px, transparent 8px 16px)' }}
                  aria-hidden="true"
                >
                  <div className="flex flex-wrap-reverse content-end justify-center gap-1 min-h-[6rem]">
                    <AnimatePresence mode="popLayout">
                      {chips.map((chip) => {
                        const { Art, size } = chip.doodle;
                        // Only chips beyond the previous count are "new" —
                        // they rain in one after another; the rest hold still.
                        const dropDelay = Math.max(0, chip.id - prevCount) * 0.08;
                        return (
                          <motion.div
                            key={chip.id}
                            layout
                            initial={reduceMotion ? { opacity: 0 } : { y: -170, opacity: 0, rotate: chip.rotate - 28 }}
                            animate={{ y: 0, opacity: 1, rotate: chip.rotate }}
                            // Reducing the amount simply fades supplies away in place
                            exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.35 } }}
                            transition={
                              reduceMotion
                                ? { duration: 0.2 }
                                : {
                                    type: 'spring', stiffness: 160, damping: 13, delay: dropDelay,
                                    opacity: { duration: 0.15, delay: dropDelay },
                                  }
                            }
                            className={cn(size, 'drop-shadow-[0_3px_4px_rgba(60,40,10,0.18)]')}
                          >
                            <Art />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                  {/* woven basket lip */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-xl bg-pencil-dark/15" />
                </div>

                {/* Classroom-grant readout */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/45">
                    <GraduationCap size={13} strokeWidth={1.5} className="text-apple" />
                    One full classroom grant
                  </span>
                  <span className="font-mono font-bold text-sm text-apple tabular-nums">
                    <AnimatedNumber value={grantPct} format={(n) => `${Math.round(n)}%`} />
                  </span>
                </div>
                <p className="text-[11px] text-chalkboard/45 font-light mt-1.5">
                  {amount >= GRANT_SIZE
                    ? `That's ${Math.floor(amount / GRANT_SIZE)} full classroom grant${Math.floor(amount / GRANT_SIZE) > 1 ? 's' : ''} — a teacher's entire wishlist, funded.`
                    : `$${GRANT_SIZE} funds a teacher's entire classroom project.`}
                </p>
              </div>
            </div>

            {/* RIGHT — the equivalence cards */}
            <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-6">
                Your {frequency === 'monthly' ? 'monthly ' : ''}gift is…
              </p>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {equivalences.map(({ item, count }, i) => {
                    const accent = ACCENTS[item.accent];
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.key}
                        layout
                        initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                        transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                        className="flex items-center gap-4 bg-paper/50 ring-1 ring-chalkboard/6 rounded-2xl px-5 py-4 hover:ring-chalkboard/15"
                        style={{ transition: 'box-shadow 500ms cubic-bezier(0.32,0.72,0,1)' }}
                      >
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ring-1', accent.bg, accent.text, accent.ring)}>
                          <Icon size={20} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-2xl md:text-3xl leading-none text-chalkboard tabular-nums">
                            <AnimatedNumber value={count} />
                          </p>
                          <p className="text-xs text-chalkboard/55 font-light mt-1 leading-snug">
                            {count === 1 ? item.singular : item.plural}
                            <span className="text-chalkboard/30"> · ~${item.unit < 1 ? item.unit.toFixed(2) : item.unit} each</span>
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <p className="mt-6 text-[11px] text-chalkboard/35 font-light leading-relaxed">
                Approximate retail equivalents. In practice, your gift goes wherever teachers need it most — supplies, staff meals, appreciation events, and classroom grants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
