import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Phone, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEvents } from '../hooks/useLocalData';

export default function EventCalendar() {
  const events = useEvents();

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-1.5">
          <div className="bg-white rounded-[calc(2rem-0.375rem)] p-10 md:p-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-ruler/10 text-ruler flex items-center justify-center">
              <CalendarIcon size={22} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-3">No Events Scheduled Yet</p>
            <h3 className="font-serif font-bold text-2xl md:text-3xl text-chalkboard leading-tight mb-3">
              The next one is being planned.
            </h3>
            <p className="text-chalkboard/55 text-sm md:text-base font-light leading-relaxed mb-7 max-w-md mx-auto">
              We're working on our next staff appreciation event. Drop us a line and we'll let you know the moment it's on the calendar.
            </p>
            <a
              href="mailto:hello@fundingmichiganteachers.org?subject=Notify%20Me%20About%20Upcoming%20Events"
              className="inline-flex items-center gap-2 bg-chalkboard text-white pl-5 pr-1.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] hover:bg-apple group active:scale-[0.98]"
              style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
            >
              Get Notified
              <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-10 rounded-[3rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-ruler/5 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700" />

          <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-ruler/10 text-ruler rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 shadow-sm">
              <CalendarIcon size={32} />
            </div>
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm",
              event.type === 'fundraiser' ? "bg-apple/5 text-apple border-apple/10" :
              event.type === 'workshop'   ? "bg-ruler/5 text-ruler border-ruler/10" :
              "bg-pencil/5 text-ink border-pencil/20"
            )}>
              {event.type}
            </span>
          </div>

          <h3 className="text-2xl font-serif font-bold mb-4 leading-tight group-hover:text-ruler transition-colors">{event.title}</h3>
          <p className="text-chalkboard/60 text-lg mb-10 leading-relaxed font-light line-clamp-3">
            {event.description}
          </p>

          <div className="space-y-4 pt-8 border-t border-chalkboard/5">
            <div className="flex items-center gap-3 text-sm font-bold text-muted uppercase tracking-widest">
              <Clock size={16} className="text-ruler" />
              <span>{new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-muted uppercase tracking-widest">
              <MapPin size={16} className="text-ruler" />
              <span className="truncate">{event.location || 'Michigan (Virtual/In-person)'}</span>
            </div>
            {event.phone && (
              <div className="flex items-center gap-3 text-sm font-bold text-muted uppercase tracking-widest">
                <Phone size={16} className="text-ruler" />
                <span>{event.phone}</span>
              </div>
            )}
            {event.deadline && (
              <div className="flex items-center gap-3 text-sm font-bold text-apple uppercase tracking-widest">
                <AlertCircle size={16} className="text-apple shrink-0" />
                <span>{event.deadline}</span>
              </div>
            )}
          </div>

          <div className="mt-10">
            {event.ctaUrl ? (
              <a
                href={event.ctaUrl}
                className="block w-full py-4 rounded-2xl bg-apple text-white font-bold text-sm hover:bg-chalkboard transition-all active:scale-95 shadow-sm text-center"
              >
                {event.ctaLabel ?? 'Learn More'}
              </a>
            ) : (
              <a
                href="mailto:hello@fundingmichiganteachers.org?subject=Event%20Inquiry"
                className="block w-full py-4 rounded-2xl border-2 border-chalkboard/5 font-bold text-sm hover:bg-chalkboard hover:text-white transition-all active:scale-95 shadow-sm text-center"
              >
                Register Interest
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
