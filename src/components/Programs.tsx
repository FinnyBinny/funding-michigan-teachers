import { motion } from 'motion/react';
import { Award, Package, ArrowRight } from 'lucide-react';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * The two things FMT runs continuously.
 *
 * Both were invisible on the site — they aren't dated events, so they never
 * appeared in the timeline, and a teacher had no way to learn that supplies
 * can simply be asked for. The supply card names the actual items we fill
 * most easily: a teacher who sees "tissues" understands the bar is low in a
 * way "classroom supplies" never conveys.
 */
const PROGRAMS = [
  {
    icon: Award,
    eyebrow: 'Every month, all year',
    title: 'Teacher of the Month',
    body: 'Three teachers are recognized every month. Honorees are announced at a staff meeting where we can make a moment of it, and they get a gift sourced from a business near their school.',
    detail: 'In October it becomes the Halloween edition — custom boo baskets, two or three teachers a week, all month long.',
    accent: 'text-apple',
    chip: 'bg-apple/10 text-apple',
  },
  {
    icon: Package,
    eyebrow: 'Open request, any time',
    title: 'Supply Restocks',
    body: 'Teachers tell us what their classroom has run out of, and we restock it. No application, no committee, no waiting for a grant cycle — just tell us what you need.',
    detail: 'The fastest ones to fill: pencils, dry erase markers, tissues, paper, notebooks, markers. Ask anyway if it is something else.',
    accent: 'text-ruler',
    chip: 'bg-ruler/10 text-ruler',
  },
];

export default function Programs() {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="text-center mb-10"
      >
        <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/50 mb-4">
          Running right now
        </p>
        <h2 className="font-serif font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em] mb-4 text-balance">
          Two things we do <span className="text-apple italic font-normal">all year</span>.
        </h2>
        <p className="text-chalkboard/65 font-light max-w-xl mx-auto leading-relaxed">
          Not events with a date on them — standing programs any teacher at a partner school
          can be part of.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {PROGRAMS.map((program, i) => (
          <motion.div
            key={program.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/8 p-7 flex flex-col gap-4 hover:ring-apple/25 hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${program.chip}`}>
              <program.icon size={20} strokeWidth={1.6} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/45 mb-1.5">
                {program.eyebrow}
              </p>
              <h3 className="font-serif font-bold text-xl leading-snug">{program.title}</h3>
            </div>

            <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{program.body}</p>

            <p className={`text-sm font-medium leading-relaxed ${program.accent}`}>
              {program.detail}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="mt-7 text-center"
      >
        <button
          onClick={() => navigate('/for-teachers')}
          className="group inline-flex items-center gap-3 bg-chalkboard text-white pl-7 pr-2 py-2 rounded-full font-bold text-sm hover:bg-apple transition-colors active:scale-[0.98]"
        >
          Teachers — ask for what you need
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight size={14} />
          </span>
        </button>
      </motion.div>
    </div>
  );
}
