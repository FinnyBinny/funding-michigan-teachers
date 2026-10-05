import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Phone, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEvents } from '../hooks/useLocalData';

export default function EventCalendar() {
  const allEvents = useEvents();

  // Only show what's actually still ahead. Without this an event kept
  // rendering under the "Upcoming Events" heading months after it happened,
  // which is exactly the kind of staleness that reads as an abandoned site.
  // Compared as YYYY-MM-DD strings so there's no timezone drift.
  const today = new Date().toISOString().slice(0, 10);
  const events = allEvents
    .filter((e) => !e.date || String(e.date).slice(0, 10) >= today)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  // The next three, with the rest a tap away: seven cards ran this section
  // to 2,600px on desktop.
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? events : events.slice(0, 3);

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
          <div className="bg-white rounded-[calc(2rem-0.375rem)] p-8 md:p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-ruler/10 text-ruler flex items-center justify-center">
              <CalendarIcon size={22} strokeWidth={1.5} />
            </div>
            <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-3">No Events Scheduled Yet</p>
            <h3 className="font-serif font-bold text-2xl md:text-3xl text-chalkboard leading-tight mb-3">
              The next one is being planned.
            </h3>
            <p className="text-chalkboard/70 text-sm md:text-base font-light leading-relaxed mb-7 max-w-md mx-auto">
              We're working on our next staff appreciation event. Drop us a line and we'll let you know the moment it's on the calendar.
            </p>
            <button
              onClick={() => {
                const box = document.getElementById('newsletter-email');
                box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                box?.focus({ preventScroll: true });
              }}
              className="inline-flex items-center gap-2 bg-chalkboard text-white pl-5 pr-1.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] hover:bg-apple group active:scale-[0.98]"
              style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
            >
              Get Notified
              <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
    <div id="upcoming-events" className="rail-sm md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8" role="region" tabIndex={0} aria-label="Upcoming events">
      {shown.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-7 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-ruler/5 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700" />

          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 bg-ruler/10 text-ruler rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 shadow-sm">
              <CalendarIcon size={26} />
            </div>
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.2em] border shadow-sm",
              event.type === 'fundraiser' ? "bg-apple/5 text-apple border-apple/10" :
              event.type === 'workshop'   ? "bg-ruler/5 text-ruler border-ruler/10" :
              "bg-pencil/5 text-ink border-pencil/20"
            )}>
              {event.type}
            </span>
          </div>

          <h3 className="text-2xl font-serif font-bold mb-4 leading-tight group-hover:text-ruler transition-colors">{event.title}</h3>
          <ClampedText text={event.description} className="text-chalkboard/75 text-base mb-6 leading-relaxed font-light" />

          <div className="space-y-3 pt-6 border-t border-chalkboard/5">
            <div className="flex items-center gap-3 text-sm font-bold text-muted uppercase tracking-widest">
              <Clock size={16} className="text-ruler" />
              <span>{new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-muted uppercase tracking-widest">
              <MapPin size={16} className="text-ruler" />
              <span>{event.location || 'Michigan (Virtual/In-person)'}</span>
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

          {/* An event is information by default.

              Every event without a link used to get a "Register Interest"
              button, which invited people to register for a boo basket
              delivery to a teacher who has already been chosen, and for FMT's
              own birthday. Nothing happens here now unless the event says
              what there is to do: a real link, or `inquiry` on the programs
              another school could actually ask to host. */}
          {(event.ctaUrl || event.inquiry) && (
            <div className="mt-7">
              {event.ctaUrl ? (
                <a
                  href={event.ctaUrl}
                  className="block w-full py-4 rounded-2xl bg-apple text-white font-bold text-sm hover:bg-chalkboard transition-all active:scale-95 shadow-sm text-center"
                >
                  {event.ctaLabel ?? 'Learn More'}
                </a>
              ) : (
                <button
                  onClick={() => { window.history.pushState({}, '', '/for-schools'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                  className="block w-full py-4 rounded-2xl border-2 border-chalkboard/10 font-bold text-sm hover:bg-chalkboard hover:text-white transition-all active:scale-95 shadow-sm text-center"
                >
                  Ask about this for your school
                </button>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
    {events.length > 3 && (
      <div className="text-center mt-8">
        <button
          onClick={() => setShowAll(!showAll)}
          aria-expanded={showAll}
          aria-controls="upcoming-events"
          className="text-sm font-bold text-ruler underline underline-offset-4 decoration-ruler/30 hover:decoration-ruler"
        >
          {showAll ? 'Show fewer' : `Show all ${events.length} upcoming events`}
        </button>
      </div>
    )}
    </>
  );
}

/**
 * Three lines, with a button to read the rest. Descriptions were clamped with
 * no way to see what was cut, and at larger text sizes most of each one was.
 */
function ClampedText({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 140;
  return (
    <div className={className}>
      <p className={long && !open ? 'line-clamp-3' : undefined}>{text}</p>
      {long && (
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mt-1.5 text-sm font-bold text-ruler underline underline-offset-4 decoration-ruler/30 hover:decoration-ruler"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
