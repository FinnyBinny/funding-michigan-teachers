import { motion } from 'motion/react';
import { Calendar, Star, Users, Gift } from 'lucide-react';
import { PAST_EVENTS, type PastEvent } from '../data/initialData';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof Calendar }> = {
  appreciation: { label: 'Appreciation', color: 'bg-apple/10 text-apple', icon: Gift },
  competition:  { label: 'Competition',  color: 'bg-ruler/10 text-ruler',  icon: Star },
  community:    { label: 'Community',    color: 'bg-pencil/10 text-pencil-dark', icon: Users },
};

function EventCard({ event, index }: { event: PastEvent; index: number }) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.appreciation;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="bg-white rounded-3xl border border-chalkboard/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 flex flex-col gap-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Month badge + type badge */}
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

      {/* Title */}
      <h4 className="text-xl font-serif font-bold text-chalkboard leading-snug">
        {event.title}
      </h4>

      {/* Description */}
      <p className="text-chalkboard/60 text-sm leading-relaxed flex-1">
        {event.description}
      </p>

      {/* Partner */}
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
  return (
    <div className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h3 className="text-3xl font-serif font-bold text-chalkboard mb-2">
          What We've Done
        </h3>
        <p className="text-chalkboard/55 text-lg max-w-xl">
          A look back at every time we showed up for Michigan teachers — from donuts to pizza, door decorating to Valentine's letters.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PAST_EVENTS.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
