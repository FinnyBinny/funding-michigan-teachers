import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Star, Users, Gift } from 'lucide-react';
import { cn } from '../lib/utils';
import { PAST_EVENTS, type PastEvent } from '../data/initialData';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof Calendar }> = {
  appreciation: { label: 'Appreciation', color: 'bg-apple/10 text-apple', icon: Gift },
  competition:  { label: 'Competition',  color: 'bg-ruler/10 text-ruler',  icon: Star },
  community:    { label: 'Community',    color: 'bg-pencil/10 text-pencil-dark', icon: Users },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "September 2025" → "2025–26"; "February 2026" → "2025–26" (school years run Jul–Jun). */
function schoolYearOf(monthLabel: string): string {
  const parts = monthLabel.split(' ');
  const year = parseInt(parts[parts.length - 1], 10);
  const monthIdx = MONTHS.indexOf(parts[0]);
  if (isNaN(year)) return monthLabel;
  const startYear = monthIdx >= 6 ? year : year - 1; // Jul (idx 6) onward = new school year
  return `${startYear}–${String(startYear + 1).slice(2)}`;
}

/** Sort key so cards render chronologically within a school year. */
function chronoKey(monthLabel: string): number {
  const parts = monthLabel.split(' ');
  const year = parseInt(parts[parts.length - 1], 10) || 0;
  const monthIdx = Math.max(MONTHS.indexOf(parts[0]), 0);
  return year * 12 + monthIdx;
}

function EventCard({ event, index }: { event: PastEvent; index: number }) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.appreciation;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
      className="bg-white rounded-3xl border border-chalkboard/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-7 flex flex-col gap-4 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 bg-chalkboard/5 text-chalkboard/70 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <Calendar size={11} />
          {event.month}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${cfg.color}`}>
          <Icon size={11} />
          {cfg.label}
        </span>
      </div>

      <h4 className="text-xl font-serif font-bold text-chalkboard leading-snug">
        {event.title}
      </h4>

      <p className="text-chalkboard/60 text-sm leading-relaxed flex-1">
        {event.description}
      </p>

      {event.partner && (
        <div className="pt-4 border-t border-chalkboard/5">
          <p className="text-xs font-bold uppercase tracking-widest text-chalkboard/35">
            Partner
          </p>
          <p className="text-sm font-semibold text-chalkboard/70 mt-0.5">
            {event.partner}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function PastEvents() {
  // Group events by school year — history stays forever, each year gets a tab.
  const { years, grouped } = useMemo(() => {
    const grouped = new Map<string, PastEvent[]>();
    for (const event of PAST_EVENTS) {
      const sy = schoolYearOf(event.month);
      if (!grouped.has(sy)) grouped.set(sy, []);
      grouped.get(sy)!.push(event);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => chronoKey(a.month) - chronoKey(b.month));
    }
    const years = [...grouped.keys()].sort().reverse(); // newest school year first
    return { years, grouped };
  }, []);

  const [activeYear, setActiveYear] = useState(years[0] ?? '');
  const events = grouped.get(activeYear) ?? [];

  if (PAST_EVENTS.length === 0) return null;

  return (
    <div className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
      >
        <div>
          <h3 className="text-3xl font-serif font-bold text-chalkboard mb-2">
            What We've Done
          </h3>
          <p className="text-chalkboard/55 text-lg max-w-xl">
            Every time we showed up for Michigan teachers — the history stays, and each new school year gets its own chapter.
          </p>
        </div>

        {/* School-year tabs */}
        {years.length > 0 && (
          <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/10 rounded-full p-1 flex items-center gap-1 w-fit">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className="relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.16em]"
                style={{ transition: 'color 500ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                {activeYear === year && (
                  <motion.span
                    layoutId="year-pill"
                    className="absolute inset-0 bg-chalkboard rounded-full"
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                  />
                )}
                <span className={cn('relative z-10', activeYear === year ? 'text-white' : 'text-chalkboard/55')}>
                  {year}
                </span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="popLayout">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
