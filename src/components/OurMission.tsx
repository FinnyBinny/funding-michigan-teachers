import { motion } from 'motion/react';
import { Coffee, BookOpen, Star, GraduationCap, ArrowRight } from 'lucide-react';
import { STAT } from '../data/impactStats';

const MISSION_POINTS = [
  {
    icon: Coffee,
    title: "At Almost Every Staff Meeting",
    description: "We show up with real food from local businesses — Chick-fil-A, Dunkin', Nothing Bundt Cakes, Ozzy's Kabob, Jamba Juice. Because a teacher still in the building at four o'clock deserves more than a granola bar.",
    color: "text-apple",
    bgColor: "bg-apple/10"
  },
  {
    icon: BookOpen,
    title: "Classroom Grants That Actually Land",
    description: "Teachers tell us what their classrooms need — lab tools, books, supplies — and we fund it directly. No grant committee. No 6-month wait. The money goes straight to the classroom.",
    color: "text-ruler",
    bgColor: "bg-ruler/10"
  },
  {
    icon: Star,
    title: "You're Seen. You're Valued.",
    description: "Door decorating competitions with $500+ in prizes. Student-written Valentine's letters. End-of-year appreciation certificates. We find every excuse to remind teachers: what you do matters, and people notice.",
    color: "text-pencil-dark",
    bgColor: "bg-pencil/20"
  }
];

/**
 * What FMT does, short. This section used to run to 2,270px on a phone: the
 * founding story, the values, a 2025–26 recap, two stat cards repeating the
 * hero, three program cards and a "Join the Movement" card. The story and the
 * values live on /about, where this links; the homepage keeps the three
 * things FMT does and one line of proof.
 */
export default function OurMission() {
  return (
    // w-full min-w-0: the section is a flex container, and without them this
    // sized itself to the swipe row's full width and slid off the left edge.
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full min-w-0">
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-6 uppercase tracking-widest">
          <GraduationCap size={14} aria-hidden="true" />
          <span>What we do</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-5 leading-[1.1] text-balance">
          We show up for teachers, <span className="text-apple italic font-normal">all year</span>.
        </h2>
        <p className="text-lg text-chalkboard/80 leading-relaxed">
          Funding Michigan teachers so no educator pays out of pocket, and every educator knows their
          work matters. Run by high school students, started by Finn Regan at 14.
        </p>
        <p className="text-base text-chalkboard/75 leading-relaxed mt-3">
          In 2025–26: {STAT.support.value} in donations and donated goods, food at almost every
          Okemos High School staff meeting, and meal cards for {STAT.tawStaff.value} staff in {STAT.tawBuildings.value} buildings
          during Teacher Appreciation Week.{' '}
          <a
            href="/about"
            onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/about'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="inline-flex items-center gap-1 text-apple font-bold hover:text-apple/80 transition-colors"
          >
            Read our story <ArrowRight size={14} aria-hidden="true" />
          </a>
        </p>
      </div>

      <div className="rail-sm md:grid md:grid-cols-3 gap-4 md:gap-6" role="region" tabIndex={0} aria-label="What we do">
        {MISSION_POINTS.map((point, index) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ delay: index * 0.1 }}
            className="p-7 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/10"
          >
            <div className={`w-12 h-12 rounded-xl ${point.bgColor} ${point.color} flex items-center justify-center mb-5`}>
              <point.icon size={20} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">{point.title}</h3>
            <p className="text-chalkboard/75 leading-relaxed font-light text-base">{point.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
