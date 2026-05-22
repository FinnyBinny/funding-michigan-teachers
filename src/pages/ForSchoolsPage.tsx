import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Heart, Sparkles, Mail,
  Coffee, UtensilsCrossed, Award, Mailbox, GraduationCap,
  Calendar, CheckCircle2, Building2,
} from 'lucide-react';
import DonationModal from '../components/DonationModal';
import { useTeachersOfMonth, useFoodPartners } from '../hooks/useLocalData';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const PROGRAMS = [
  {
    icon: Award,
    eyebrow: 'Recognition',
    title: 'Teacher of the Month',
    summary: 'Three educators are spotlighted each month — chosen by students, staff, and FMT leadership. Each honoree gets a feature on our site, a personalized certificate, and a small gift sourced from local Okemos businesses.',
    bullet: ['Public spotlight on FMT site + social', 'Personalized certificate of appreciation', 'Small gift from a local Okemos partner'],
    accent: 'apple',
  },
  {
    icon: UtensilsCrossed,
    eyebrow: 'Every Staff Meeting',
    title: 'Food at Staff Meetings',
    summary: 'During every staff meeting of the school year, we bring real food — donated by local businesses — to the teachers\' lounge. No teacher pulls out cash for a vending-machine dinner before parent-teacher conferences.',
    bullet: ['Catered or donated by local Okemos partners', 'Year-round, every monthly meeting', '100% community-funded — never on the teacher'],
    accent: 'ruler',
  },
  {
    icon: Sparkles,
    eyebrow: 'Whole-Staff Events',
    title: 'Staff Appreciation Events',
    summary: 'Door decorating competitions with $500+ in prizes, end-of-year appreciation banquets, holiday gift drives, and surprise classroom-supply restocks during the busiest weeks of the school year.',
    bullet: ['Door decorating competition with cash prizes', 'Surprise classroom supply restocks', 'End-of-year appreciation gathering'],
    accent: 'pencil',
  },
  {
    icon: Mailbox,
    eyebrow: 'Student-Driven',
    title: 'Post Office of Love',
    summary: 'Every February, students across the school write Valentine\'s-style appreciation letters to teachers who shaped them. FMT runs the campaign, collects every letter, and personally delivers them to each teacher\'s mailbox.',
    bullet: ['Student-written letters of appreciation', 'Hand-delivered to every teacher', 'Annual Valentine\'s week tradition'],
    accent: 'apple',
  },
];

const ACCENT_MAP = {
  apple:  { text: 'text-apple',  bg: 'bg-apple/10',  ring: 'ring-apple/20',  dot: 'bg-apple' },
  ruler:  { text: 'text-ruler',  bg: 'bg-ruler/10',  ring: 'ring-ruler/20',  dot: 'bg-ruler' },
  pencil: { text: 'text-pencil-dark', bg: 'bg-pencil/20', ring: 'ring-pencil/30', dot: 'bg-pencil' },
} as const;

const IMPACT_NUMBERS = [
  { value: '1,200+', label: 'Teachers Reached', color: 'text-apple' },
  { value: '$4,000+', label: 'Raised for Classrooms', color: 'text-ruler' },
  { value: '12+', label: 'Appreciation Events', color: 'text-pencil-dark' },
  { value: '100%', label: 'Direct to Teachers', color: 'text-apple' },
];

const ROADMAP = [
  { phase: 'Month 1', title: 'Listening Tour', detail: 'We meet with admin, dept leads, and a small group of teachers to learn what your staff actually needs — no template, no assumptions.' },
  { phase: 'Month 2', title: 'First Staff Meeting Drop', detail: 'Our first food drop at a staff meeting. Partnered with one local business in your community. Zero cost to the school.' },
  { phase: 'Month 3', title: 'Launch Teacher of the Month', detail: 'Nominations open. First three honorees are featured site-wide. The program becomes a visible, named thing in your building.' },
  { phase: 'Month 4', title: 'Door Decorating Competition', detail: 'A school-wide event with $500+ in prizes. Students decorate, staff vote. Builds morale and gets the whole building talking.' },
  { phase: 'Month 5', title: 'Post Office of Love', detail: 'Student-written letter campaign rolls out across all grades. Every teacher gets a letter. No teacher gets forgotten.' },
  { phase: 'End of Year', title: 'Trial Year Review', detail: 'We sit down with admin, share an honest report on every dollar and every event, and decide together what year two looks like.' },
];

export default function ForSchoolsPage() {
  const [showDonation, setShowDonation] = useState(false);
  const teachersOfMonth = useTeachersOfMonth();
  const foodPartners = useFoodPartners();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroTitleY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Scroll-to-section
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">

      {/* Floating glass nav island */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-2xl ring-1 ring-chalkboard/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-1 pl-2 pr-2 py-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-chalkboard/5 transition-colors"
            style={{ transition: `all 600ms cubic-bezier(${EASE.join(',')})` }}
          >
            <span className="w-7 h-7 rounded-full bg-chalkboard/5 flex items-center justify-center group-hover:bg-chalkboard/10 transition-colors">
              <ArrowLeft size={13} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hidden sm:inline">Home</span>
          </button>
          <div className="w-px h-6 bg-chalkboard/10 mx-1" />
          <div className="hidden md:flex items-center gap-0.5">
            <button onClick={() => scrollTo('programs')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5 transition-colors">Programs</button>
            <button onClick={() => scrollTo('teachers-of-month')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5 transition-colors">Honorees</button>
            <button onClick={() => scrollTo('roadmap')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5 transition-colors">Trial Year</button>
            <button onClick={() => scrollTo('cta')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5 transition-colors">Bring to Your School</button>
          </div>
          <a
            href="mailto:hello@fundingmichiganteachers.org?subject=For%20Schools%20%E2%80%94%20Bring%20FMT%20to%20Our%20District"
            className="group flex items-center gap-2 bg-chalkboard text-white pl-4 pr-1 py-1 rounded-full hover:bg-apple transition-colors ml-1"
            style={{ transition: `all 600ms cubic-bezier(${EASE.join(',')})` }}
          >
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold">Get in Touch</span>
            <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight size={12} />
            </span>
          </a>
        </div>
      </nav>

      {/* HERO — Editorial Split layout */}
      <section
        ref={heroRef}
        className="viewport-section px-4 sm:px-6 lg:px-10 pt-32 pb-16 overflow-hidden"
      >
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/8 rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-ruler/8 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left — Editorial copy */}
          <motion.div
            style={{ y: heroTitleY, opacity: heroOpacity }}
            className="lg:col-span-7"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="inline-flex items-center gap-2 bg-white ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.24em] text-chalkboard/70 mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-apple animate-pulse" />
              Trial Period Complete · Growing for 2026–27
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="font-serif font-bold leading-[0.95] text-[clamp(2.75rem,8vw,5.75rem)] tracking-[-0.02em] mb-7"
            >
              Bring the<br/>
              programs that <span className="text-apple italic font-normal">empower teachers</span><br/>
              <span className="text-chalkboard/30">to your school.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              className="text-lg text-chalkboard/65 max-w-xl leading-relaxed font-light mb-10"
            >
              Okemos High School was our trial period — three school years of showing up at every staff meeting, every appreciation event, without fail. Now we're growing. Funding Michigan Teachers is opening pilot spots for new schools across Michigan. Same programs. Same student-led model. Zero cost to your building.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => scrollTo('cta')}
                className="group flex items-center gap-2 bg-chalkboard text-white pl-7 pr-2 py-2 rounded-full font-bold text-sm shadow-[0_12px_30px_rgba(0,0,0,0.18)] active:scale-[0.98]"
                style={{ transition: `all 600ms cubic-bezier(${EASE.join(',')})` }}
              >
                <span className="uppercase tracking-[0.18em]">Bring FMT to Our School</span>
                <span className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-apple flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-all">
                  <ArrowRight size={14} />
                </span>
              </button>
              <button
                onClick={() => scrollTo('programs')}
                className="flex items-center gap-2 bg-white ring-1 ring-chalkboard/15 hover:ring-chalkboard/30 px-7 py-3 rounded-full font-bold text-sm text-chalkboard/70 hover:text-chalkboard uppercase tracking-[0.18em] transition-all"
              >
                See the Programs
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-9 text-[10px] text-chalkboard/35 font-bold uppercase tracking-[0.24em] flex items-center gap-2"
            >
              <span className="inline-block w-4 h-px bg-chalkboard/20" />
              Student-Led · 501(c)(3) · EIN 93-4485967
              <span className="inline-block w-4 h-px bg-chalkboard/20" />
            </motion.p>
          </motion.div>

          {/* Right — Double-Bezel stat card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            className="lg:col-span-5 relative"
          >
            {/* Outer shell */}
            <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/8 rounded-[2.25rem] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              {/* Inner core */}
              <div className="bg-white rounded-[calc(2.25rem-0.5rem)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                <div className="flex items-center gap-2 mb-7">
                  <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-chalkboard/40">Impact Snapshot</span>
                  <div className="h-px flex-1 bg-chalkboard/10" />
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                  {IMPACT_NUMBERS.map((n, i) => (
                    <motion.div
                      key={n.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: EASE }}
                    >
                      <p className={`font-serif font-bold text-4xl leading-none ${n.color}`}>{n.value}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-chalkboard/45 mt-2">{n.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-chalkboard/8">
                  <p className="text-xs text-chalkboard/55 leading-relaxed font-light">
                    A trial year with FMT means zero financial ask of your school — we bring the funding, the partners, the programs, and the student leadership. You just open the door.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-3 -right-3 bg-apple text-white rounded-2xl px-3.5 py-2 text-[9px] uppercase tracking-[0.2em] font-bold shadow-[0_8px_20px_rgba(192,57,43,0.35)] rotate-3">
              No cost to schools
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROGRAMS — Asymmetrical Bento */}
      <section id="programs" className="viewport-section py-24 sm:py-32 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-apple/10 text-apple px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-[0.24em]">
                <Sparkles size={11} />
                What We Run
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold leading-[1] tracking-[-0.02em] mb-6">
                Four programs.<br/>
                <span className="text-apple italic font-normal">Every month.</span> Every year.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="lg:col-span-5 lg:pt-6"
            >
              <p className="text-lg text-chalkboard/60 leading-relaxed font-light">
                These aren't one-off events. They are the rhythm of how we show up. Same programs, same months, every year — that's how appreciation stops feeling like a stunt and starts feeling like culture.
              </p>
            </motion.div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {PROGRAMS.map((program, i) => {
              const accent = ACCENT_MAP[program.accent as keyof typeof ACCENT_MAP];
              // Asymmetric layout: 0=wide, 1=narrow, 2=narrow, 3=wide
              const span = i === 0 || i === 3 ? 'md:col-span-7' : 'md:col-span-5';
              const Icon = program.icon;
              return (
                <motion.article
                  key={program.title}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                  className={`${span} group`}
                >
                  {/* Outer bezel shell */}
                  <div className="h-full bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-1.5 hover:ring-chalkboard/15 transition-all"
                       style={{ transition: `all 700ms cubic-bezier(${EASE.join(',')})` }}>
                    {/* Inner core */}
                    <div className="h-full bg-white rounded-[calc(2rem-0.375rem)] p-8 md:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] flex flex-col">
                      <div className="flex items-start justify-between mb-7">
                        <div className={`w-12 h-12 rounded-2xl ${accent.bg} ring-1 ${accent.ring} flex items-center justify-center group-hover:rotate-6 transition-transform`}
                             style={{ transition: `transform 700ms cubic-bezier(${EASE.join(',')})` }}>
                          <Icon size={20} className={accent.text} />
                        </div>
                        <span className={`text-[10px] uppercase tracking-[0.24em] font-bold ${accent.text} px-2.5 py-1 rounded-full ${accent.bg}`}>
                          {program.eyebrow}
                        </span>
                      </div>

                      <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-[-0.01em] mb-4 leading-[1.05]">
                        {program.title}
                      </h3>

                      <p className="text-chalkboard/60 text-base font-light leading-relaxed mb-7 flex-1">
                        {program.summary}
                      </p>

                      <ul className="space-y-2.5 mt-auto">
                        {program.bullet.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-sm text-chalkboard/75 leading-snug">
                            <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEACHERS OF THE MONTH */}
      <section id="teachers-of-month" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-10 bg-chalkboard text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] bg-pencil/10 rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-apple/10 rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
             style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-pencil/15 text-pencil ring-1 ring-pencil/30 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-[0.24em]">
                <Award size={11} />
                May 2026 · Teacher Appreciation Week
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold leading-[1] tracking-[-0.02em] text-white">
                Teachers of <span className="text-pencil italic font-normal">the Month</span>.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="lg:col-span-5 lg:pt-4"
            >
              <p className="text-white/55 text-lg font-light leading-relaxed">
                Three educators a month. Nominated by students, voted by staff, recognized publicly — because the people who change lives every day deserve to have it said out loud.
              </p>
            </motion.div>
          </div>

          {/* Featured ceremony image */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: EASE }}
            className="mb-12"
          >
            <div className="bg-white/[0.04] ring-1 ring-white/10 rounded-[2.25rem] p-2">
              <div className="relative rounded-[calc(2.25rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <img
                  src="/images/may-staff-meeting.jpg"
                  alt="May 2026 OHS staff meeting — Teacher of the Month certificates for Mrs. Turner, Miss Richter, and Miss Abbott"
                  className="w-full aspect-[16/9] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chalkboard via-chalkboard/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="inline-flex items-center gap-2 bg-pencil/20 text-pencil ring-1 ring-pencil/30 px-3 py-1.5 rounded-full text-[10px] font-bold mb-4 uppercase tracking-[0.22em]">
                    <Calendar size={11} />
                    Caught in the act
                  </div>
                  <p className="font-serif font-bold text-2xl md:text-3xl text-white leading-tight max-w-3xl">
                    May 2026 — the Okemos High School staff meeting where we announced our three Teachers of the Month and surprised the entire staff with appreciation gifts.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Honoree cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {teachersOfMonth.slice(0, 3).map((teacher, i) => (
              <motion.article
                key={teacher.id ?? teacher.teacher_name}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
                className="group relative"
              >
                {/* Outer bezel shell — dark */}
                <div className="h-full bg-white/[0.04] ring-1 ring-white/10 rounded-[2rem] p-1.5 group-hover:ring-white/20 transition-all"
                     style={{ transition: `all 700ms cubic-bezier(${EASE.join(',')})` }}>
                  {/* Inner core */}
                  <div className="h-full bg-gradient-to-b from-[#161718] to-[#0e0f10] rounded-[calc(2rem-0.375rem)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col">
                    {/* Month tag */}
                    <div className="flex items-center justify-between mb-7">
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-bold text-pencil bg-pencil/10 ring-1 ring-pencil/20 px-2.5 py-1 rounded-full">
                        <Calendar size={10} />
                        {teacher.month}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/30">#{String(i + 1).padStart(2, '0')}</span>
                    </div>

                    {/* Avatar — outer/inner concentric */}
                    <div className="mb-6 w-fit">
                      <div className="bg-white/5 ring-1 ring-white/10 rounded-3xl p-1.5">
                        {teacher.image ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                            <img src={teacher.image} alt={teacher.teacher_name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pencil/30 to-apple/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                            <GraduationCap size={28} className="text-pencil" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="font-serif font-bold text-2xl text-white leading-tight mb-1">
                      {teacher.teacher_name}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-white/40 mb-5">
                      {[teacher.subject, teacher.school].filter(Boolean).join(' · ')}
                    </p>

                    {/* Why */}
                    <blockquote className="text-white/65 text-sm font-light leading-relaxed border-l-2 border-pencil/30 pl-4 flex-1">
                      {teacher.why}
                    </blockquote>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* 600+ staff impact callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-12 bg-white/[0.04] ring-1 ring-white/10 rounded-[2.25rem] p-2"
          >
            <div className="bg-gradient-to-br from-[#161718] to-[#0e0f10] rounded-[calc(2.25rem-0.5rem)] grid md:grid-cols-12 gap-0 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {/* Image side */}
              <div className="md:col-span-5 relative">
                <div className="aspect-square md:aspect-auto md:h-full">
                  <img
                    src="/images/may-chick-fil-a-cards.jpg"
                    alt="Chick-fil-A 'Be our guest' meal cards distributed to over 600 staff across every Okemos school"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-chalkboard/40 md:to-chalkboard/0" />
                </div>
              </div>

              {/* Copy side */}
              <div className="md:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-apple/15 text-apple ring-1 ring-apple/30 px-3 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-[0.22em] w-fit">
                  <Sparkles size={11} />
                  And there's more
                </div>
                <h3 className="font-serif font-bold text-3xl md:text-4xl text-white leading-[1.05] tracking-[-0.01em] mb-5">
                  <span className="text-pencil italic font-normal">600+ staff members</span><br/>
                  across every Okemos school.
                </h3>
                <p className="text-white/55 text-base md:text-lg font-light leading-relaxed mb-7">
                  During Teacher Appreciation Week, FMT teamed up with <span className="text-white font-medium">Chick-fil-A Okemos (W Grand River)</span> to distribute "Be our guest" meal cards to every single staff member across all Okemos schools. Not one building. Not one department. The whole district.
                </p>
                <div className="grid grid-cols-3 gap-5 pt-6 border-t border-white/10">
                  <div>
                    <p className="font-serif font-bold text-3xl text-pencil leading-none">600+</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40 mt-2">Staff reached</p>
                  </div>
                  <div>
                    <p className="font-serif font-bold text-3xl text-pencil leading-none">All</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40 mt-2">Okemos schools</p>
                  </div>
                  <div>
                    <p className="font-serif font-bold text-3xl text-pencil leading-none">1</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40 mt-2">Local partner</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOD PARTNERS — proof of monthly cadence */}
      <section className="viewport-section py-24 sm:py-32 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-ruler/10 text-ruler ring-1 ring-ruler/20 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-[0.24em]">
                <Coffee size={11} />
                Proof of cadence
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold leading-[1] tracking-[-0.02em] mb-2">
                Every month, a <span className="text-ruler italic font-normal">local business</span><br/>
                feeds your staff.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="lg:col-span-5 lg:pt-4"
            >
              <p className="text-chalkboard/60 text-lg font-light leading-relaxed">
                We don't ask the school to source food. We don't ask the PTA. We line up local partners in your community and deliver — every single staff meeting.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {foodPartners.slice(0, 4).map((partner, i) => (
              <motion.div
                key={partner.id ?? partner.business}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                className="group"
              >
                <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[1.75rem] p-1.5 group-hover:ring-chalkboard/15 transition-all"
                     style={{ transition: `all 700ms cubic-bezier(${EASE.join(',')})` }}>
                  <div className="relative aspect-[3/4] rounded-[calc(1.75rem-0.375rem)] overflow-hidden bg-chalkboard">
                    {partner.image ? (
                      <picture>
                        {partner.avif && <source srcSet={partner.avif} type="image/avif" />}
                        <img
                          src={partner.image}
                          alt={`${partner.business} — ${partner.month}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          style={{ transition: `transform 1200ms cubic-bezier(${EASE.join(',')})` }}
                          loading="lazy"
                        />
                      </picture>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pencil/20 to-apple/20 flex items-center justify-center">
                        <UtensilsCrossed size={32} className="text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-chalkboard/90 via-chalkboard/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-pencil text-[9px] uppercase tracking-[0.22em] font-bold mb-1">{partner.month}</p>
                      <p className="text-white font-bold text-sm leading-tight">{partner.business}</p>
                      <p className="text-white/60 text-[11px] mt-1 leading-snug">{partner.detail}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIAL YEAR ROADMAP */}
      <section id="roadmap" className="viewport-section py-24 sm:py-32 px-4 sm:px-6 lg:px-10 bg-paper">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-pencil/20 text-chalkboard ring-1 ring-pencil/40 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-[0.24em]">
                <Calendar size={11} />
                Trial Year
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold leading-[1] tracking-[-0.02em] mb-6">
                Here's exactly<br/>
                <span className="text-apple italic font-normal">what year one</span> looks like.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="lg:col-span-5 lg:pt-4"
            >
              <p className="text-lg text-chalkboard/60 leading-relaxed font-light">
                We are intentional about not over-promising. A trial year is a structured 6-step rollout — small enough that we never miss, big enough that your staff will feel it from week one.
              </p>
            </motion.div>
          </div>

          {/* Vertical roadmap */}
          <div className="relative">
            <div className="absolute left-7 md:left-9 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-chalkboard/15 to-transparent" />

            <div className="space-y-4">
              {ROADMAP.map((step, i) => (
                <motion.div
                  key={step.phase}
                  initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
                  className="relative flex gap-5 md:gap-8 items-start group"
                >
                  {/* Number dot */}
                  <div className="relative shrink-0 mt-1">
                    <div className="w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] bg-white ring-1 ring-chalkboard/10 rounded-2xl p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-apple to-apple/80 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                        <span className="font-serif font-bold text-white text-lg md:text-xl">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 bg-white ring-1 ring-chalkboard/8 rounded-[1.5rem] p-6 md:p-7 hover:ring-chalkboard/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all"
                       style={{ transition: `all 700ms cubic-bezier(${EASE.join(',')})` }}>
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <span className="text-[10px] uppercase tracking-[0.24em] font-bold text-apple">{step.phase}</span>
                      <h3 className="font-serif font-bold text-2xl text-chalkboard tracking-[-0.01em]">{step.title}</h3>
                    </div>
                    <p className="text-chalkboard/60 text-base font-light leading-relaxed">{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="viewport-section py-24 sm:py-32 px-4 sm:px-6 lg:px-10 bg-chalkboard text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/12 rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 w-[500px] h-[500px] bg-ruler/12 rounded-full blur-[140px]" />

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/8 ring-1 ring-white/15 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-8 uppercase tracking-[0.24em]">
              <span className="w-1.5 h-1.5 rounded-full bg-apple animate-pulse" />
              Limited to 3 Pilot Schools · 2026–27
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-bold leading-[0.95] tracking-[-0.02em] text-balance mb-8">
              Bring this<br/>
              <span className="text-apple italic font-normal">to your school.</span>
            </h2>
            <p className="text-lg text-white/55 max-w-2xl mx-auto font-light leading-relaxed mb-12">
              We're opening three pilot spots for the 2026–27 school year. If you're an admin, a department lead, or a teacher who thinks your building deserves this — start the conversation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:hello@fundingmichiganteachers.org?subject=For%20Schools%20%E2%80%94%20Bring%20FMT%20to%20Our%20District&body=Hi%20FMT%20team%2C%0A%0AOur%20school%20is%20interested%20in%20the%20FMT%20trial%20year.%20Here's%20a%20little%20about%20us%3A%0A%0A-%20School%20Name%3A%0A-%20District%3A%0A-%20Approximate%20Staff%20Size%3A%0A-%20Best%20Contact%20%3A%0A%0AThanks!"
                className="group flex items-center gap-3 bg-apple text-white pl-7 pr-2 py-2 rounded-full font-bold shadow-[0_15px_40px_rgba(192,57,43,0.4)] active:scale-[0.98] text-sm uppercase tracking-[0.18em]"
                style={{ transition: `all 700ms cubic-bezier(${EASE.join(',')})` }}
              >
                <Mail size={15} />
                <span>Start the Conversation</span>
                <span className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-all">
                  <ArrowRight size={14} />
                </span>
              </a>
              <button
                onClick={() => setShowDonation(true)}
                className="flex items-center gap-3 bg-white/8 ring-1 ring-white/15 hover:bg-white/15 px-7 py-3 rounded-full font-bold text-sm uppercase tracking-[0.18em] transition-all"
              >
                <Heart size={15} className="text-apple" />
                Support a Pilot School
              </button>
            </div>

            <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Building2, label: 'You provide', text: 'Permission, a staff meeting slot, and one in-building advocate' },
                { icon: CheckCircle2, label: 'We provide', text: 'Funding, food partners, prizes, marketing, and student volunteers' },
                { icon: Heart, label: 'Your staff gets', text: 'Recognition, real meals, and a building that feels valued' },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: EASE }}
                  className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-5 text-left"
                >
                  <c.icon size={18} className="text-pencil mb-3" />
                  <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40 mb-1">{c.label}</p>
                  <p className="text-sm text-white/80 font-light leading-snug">{c.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0b0c] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-white/30 text-xs">
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Funding Michigan Teachers</span>
            <span className="font-mono uppercase tracking-widest text-[9px] px-3 py-1 bg-white/5 rounded-full">EIN: 93-4485967</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">Main Site</button>
            <button onClick={() => navigate('/sponsors')} className="hover:text-white transition-colors cursor-pointer">Sponsors</button>
            <a href="mailto:hello@fundingmichiganteachers.org" className="hover:text-white transition-colors">hello@fundingmichiganteachers.org</a>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />

      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
