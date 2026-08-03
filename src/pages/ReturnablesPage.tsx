import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, ArrowDown, Heart, Loader2, CheckCircle2, Send,
  ClipboardList, Truck, School, ChevronDown, ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { track, captureSource } from '../lib/analytics';
import { PopCan, Bottle, Dime, SchoolHouse } from '../components/campaignDoodles';
import SiteFooter from '../components/SiteFooter';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/* ═══════════════════════════════════════════════════════════════════════
   CAMPAIGN CONFIG — everything an admin is likely to change lives here.
   ═══════════════════════════════════════════════════════════════════════ */
const CAMPAIGN = {
  /** Matches the address printed on the door hanger. */
  contactEmail: 'donate@fundingmichiganteachers.org',
  /** Shown near the address fields and in the FAQ. */
  serviceArea: 'the Greater Lansing area — Okemos, East Lansing, Haslett, Lansing, Holt, and nearby',
  /** Soft check only: an out-of-area ZIP shows a note, it never blocks submitting. */
  serviceZips: [
    '48864', '48823', '48825', '48840', '48842', '48854', '48895', '48912',
    '48910', '48911', '48906', '48915', '48917', '48933', '48819', '48827',
  ],
  faq: [
    {
      q: 'What can I donate?',
      a: 'Michigan deposit-eligible cans and bottles — the ones worth 10¢ when you return them. If it has "MI 10¢" on the label, we can take it.',
    },
    {
      q: 'Do I have to sort them?',
      a: "Nope. Don't worry about sorting at all — just bag them up and we'll take care of the rest.",
    },
    {
      q: 'Do I need to be home?',
      a: "Either works. You can hand them to us in person, or leave them out somewhere we can reach them — just make sure they're easy to grab, not blocking the sidewalk or street, and allowed under your HOA or local rules. We'll always coordinate with you before we come.",
    },
    {
      q: 'When will you pick them up?',
      a: "Tell us the day and window that works for you on the form, and we'll confirm with you directly. We don't schedule anything without checking with you first.",
    },
    {
      q: 'Where do you pick up?',
      a: 'We currently pick up across the Greater Lansing area. If you\'re just outside it, send the form anyway — we\'ll let you know what we can do.',
    },
    {
      q: 'Can I drop them off instead?',
      a: "Get in touch and we'll coordinate something that works for you.",
    },
    {
      q: 'What happens to the money?',
      a: 'Every deposit we redeem goes into supporting local teachers — classroom supplies, food at staff meetings, and teacher appreciation. We\'re a student-led 501(c)(3).',
    },
    {
      q: 'Can I just donate money instead?',
      a: 'Of course — and it helps just as much. There\'s a donate button on this page.',
    },
  ],
  /** Swap in bottle-drive photos when there are some. */
  photos: [
    { src: '/images/IMG_5568-opt.jpg', caption: 'Special delivery', rotate: -3, y: 0 },
    { src: '/images/coffee-bar-biggby-opt.jpg', caption: 'Coffee bar, staffed by students', rotate: 2.5, y: 16 },
    { src: '/images/may-staff-meeting.jpg', caption: 'Teacher of the Month, announced live', rotate: -1.5, y: 6 },
  ],
} as const;

const STEPS = [
  {
    icon: ClipboardList,
    title: 'You sign up',
    copy: 'Fill out the short form below and tell us where your returnables are and when we can come by.',
  },
  {
    icon: Truck,
    title: 'We collect',
    copy: "Our student volunteers pick them up and take them in. You don't sort anything.",
  },
  {
    icon: School,
    title: 'Teachers benefit',
    copy: 'Every dime goes toward classroom supplies, staff meals, and teacher appreciation.',
  },
];

/** Teal marker scribble under a word — draws itself once, like the door hanger. */
function Scribble({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('absolute left-0 right-0 -bottom-1 h-3 w-full', className)}
    >
      <motion.path
        d="M3 9c26-5 52-6 78-4s52 6 78 1"
        fill="none"
        stroke="var(--color-campaign-teal)"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      />
    </svg>
  );
}

export default function ReturnablesPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState('direct');

  useEffect(() => {
    window.scrollTo(0, 0);
    setSource(captureSource());
    track('returnables_page_view', { source: captureSource() });
  }, []);

  const goToForm = (where: string) => {
    track('returnables_cta_clicked', { location: where });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goDonate = (where: string) => {
    track('stripe_donation_clicked', { location: where });
    navigate('/donate');
  };

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative">
      {/* Floating glass nav island — same as every other sub-page */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/85 backdrop-blur-2xl ring-1 ring-chalkboard/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-1 pl-2 pr-2 py-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-chalkboard/5"
            style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
          >
            <span className="w-7 h-7 rounded-full bg-chalkboard/5 flex items-center justify-center group-hover:bg-chalkboard/10">
              <ArrowLeft size={13} strokeWidth={1.5} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hidden sm:inline">Home</span>
          </button>
          <div className="w-px h-6 bg-chalkboard/10 mx-1" />
          <button
            onClick={() => goDonate('nav')}
            className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5"
          >
            Donate
          </button>
        </div>
      </nav>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-0 left-0 w-[600px] h-[600px] bg-apple/[0.06] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" />
      <div className="pointer-events-none absolute top-[40%] right-0 w-[500px] h-[500px] bg-[var(--color-campaign-teal)]/[0.08] rounded-full blur-[160px] translate-x-1/3" />

      <main className="relative z-10 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">

          {/* ═══ 1. HERO ═══ */}
          <section className="text-center max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-bold text-chalkboard/45 mb-5"
            >
              Funding Michigan Teachers presents
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
              className="font-serif font-bold leading-[0.95] tracking-[-0.02em] text-[clamp(2.5rem,9vw,4.75rem)] text-apple mb-6"
            >
              <span className="relative inline-block">
                Your Cans.
                <Scribble />
              </span>
              <br />
              <span className="text-chalkboard">Their Classrooms.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="text-base sm:text-lg text-chalkboard/65 font-light leading-relaxed max-w-xl mx-auto mb-8"
            >
              Your empty cans and bottles can do more than sit in the garage. Donate your
              Michigan returnables and we'll turn those 10¢ deposits into real support for
              local teachers and classrooms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={() => goToForm('hero')}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-apple text-white pl-8 pr-2.5 py-2.5 rounded-full font-bold text-sm uppercase tracking-[0.18em] shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.98] min-h-[52px]"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Donate My Returnables
                <span className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-y-0.5 transition-transform">
                  <ArrowDown size={15} />
                </span>
              </button>

              <button
                onClick={() => goDonate('hero')}
                className="text-sm font-bold text-chalkboard/55 hover:text-apple underline underline-offset-4 decoration-chalkboard/20 hover:decoration-apple min-h-[44px] px-2 transition-colors"
              >
                Don't have cans? Make a donation
              </button>
            </motion.div>

            {/* Marching cans → schoolhouse */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mt-12 sm:mt-14"
              aria-hidden="true"
            >
              {/* crayon path */}
              <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-2 w-full h-10">
                <path
                  d="M10 30c60-14 120 8 180-2s130-12 200 4"
                  fill="none"
                  stroke="var(--color-pencil)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>

              <div className="relative flex items-end justify-center gap-1.5 sm:gap-3">
                {[
                  { C: () => <PopCan color="#E8564A" />, size: 38, delay: 0 },
                  { C: () => <Bottle color="#5EA9DD" />, size: 42, delay: 0.1 },
                  { C: () => <Dime />, size: 22, delay: 0.2 },
                  { C: () => <PopCan color="#4bbfb3" />, size: 36, delay: 0.3 },
                  { C: () => <Bottle color="#FFD54F" />, size: 40, delay: 0.4 },
                  { C: () => <Dime />, size: 20, delay: 0.5 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    style={{ width: item.size, height: item.size }}
                    initial={{ y: 0 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
                    className="drop-shadow-[0_3px_4px_rgba(60,40,10,0.15)] shrink-0"
                  >
                    <item.C />
                  </motion.div>
                ))}
                <div className="w-16 h-14 sm:w-20 sm:h-18 shrink-0 ml-1 drop-shadow-[0_4px_6px_rgba(60,40,10,0.18)]">
                  <SchoolHouse />
                </div>
              </div>
            </motion.div>
          </section>

          {/* ═══ 2. HOW IT WORKS ═══ */}
          <section className="mt-20 sm:mt-24">
            <h2 className="text-center font-serif font-bold text-3xl sm:text-4xl leading-tight tracking-[-0.01em] mb-3">
              Your empties can do something{' '}
              <span className="text-apple italic font-normal">pretty great</span>.
            </h2>
            <p className="text-center font-hand text-lg text-chalkboard/45 -rotate-1 mb-10">
              three steps, and you're done
            </p>

            <div className="grid md:grid-cols-3 gap-5 md:gap-6 items-start max-w-5xl mx-auto">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                  className="relative bg-white p-6 sm:p-7 rounded-[1.75rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-chalkboard/5"
                >
                  {/* connecting arrow, desktop only */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-10 text-[var(--color-campaign-teal)]" aria-hidden="true">
                      <ArrowRight size={20} strokeWidth={2.5} />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--color-campaign-teal)]/15 text-[var(--color-campaign-teal)] flex items-center justify-center shrink-0">
                      <step.icon size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/35">
                        Step {i + 1}
                      </p>
                      <h3 className="text-lg font-serif font-bold leading-tight">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-chalkboard/60 font-light leading-relaxed">{step.copy}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ═══ 3. PICKUP FORM ═══ */}
          <section ref={formRef} id="pickup" className="mt-20 sm:mt-24 scroll-mt-24">
            <div className="text-center mb-8">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl leading-tight tracking-[-0.01em] mb-3">
                Got cans? <span className="text-apple italic font-normal">We'll take it from here.</span>
              </h2>
              <p className="text-chalkboard/60 font-light leading-relaxed max-w-xl mx-auto">
                Tell us a little about your returnables and we'll coordinate the pickup with you.
              </p>
            </div>
            <PickupForm source={source} />
          </section>

          {/* ═══ 4. WHY RETURNABLES ═══ */}
          <section className="mt-20 sm:mt-24 max-w-4xl mx-auto">
            <div className="bg-chalkboard rounded-[2rem] p-7 sm:p-10 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-snug tracking-[-0.01em] mb-4">
                  Ten cents doesn't feel like much.
                  <br />
                  <span className="text-pencil italic font-normal">Until a whole neighborhood gets involved.</span>
                </h2>
                <p className="text-white/55 font-light leading-relaxed max-w-lg mx-auto text-sm sm:text-base">
                  One household might have a few dollars sitting in the garage. A whole
                  community can turn that into something much bigger. Every returned
                  container adds to the campaign.
                </p>

                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
                      className="w-8 h-8 sm:w-9 sm:h-9"
                    >
                      {i % 2 === 0 ? <PopCan color="#E8564A" /> : <Bottle color="#5EA9DD" />}
                    </motion.div>
                  ))}
                  <ArrowRight size={20} className="text-white/40 mx-1" />
                  <div className="w-9 h-9 sm:w-10 sm:h-10">
                    <SchoolHouse />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-[var(--color-campaign-teal)]/10 rounded-full blur-[100px]" />
            </div>
          </section>

          {/* ═══ 5. SCRAPBOOK ═══ */}
          <section className="mt-20 sm:mt-24">
            <h2 className="text-center font-serif font-bold text-3xl sm:text-4xl leading-tight tracking-[-0.01em] mb-2">
              This is who you're <span className="text-apple italic font-normal">helping</span>.
            </h2>
            <p className="text-center font-hand text-lg text-chalkboard/45 -rotate-1 mb-10">
              real teachers, real classrooms, right here
            </p>

            <div className="flex flex-wrap justify-center items-start gap-5 md:gap-3">
              {CAMPAIGN.photos.map((photo, i) => (
                <motion.figure
                  key={photo.src}
                  initial={{ opacity: 0, y: 36, rotate: 0 }}
                  whileInView={{ opacity: 1, y: photo.y, rotate: photo.rotate }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: i * 0.09, ease: EASE }}
                  className="polaroid w-[46%] sm:w-52 md:w-56 shrink-0"
                  style={{ rotate: `${photo.rotate}deg` }}
                >
                  <div className="aspect-square overflow-hidden rounded-[2px] bg-chalkboard/5">
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption className="font-hand text-sm text-chalkboard/60 text-center py-3 px-1 leading-tight">
                    {photo.caption}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </section>

          {/* ═══ 6. SECONDARY DONATION ═══ */}
          <section className="mt-20 sm:mt-24 max-w-2xl mx-auto">
            <div className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-7 sm:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-4">
                <Heart size={22} strokeWidth={1.5} className="fill-current" />
              </div>
              <h2 className="font-serif font-bold text-2xl mb-3 leading-tight">
                No returnables? You can still help.
              </h2>
              <p className="text-sm text-chalkboard/60 font-light leading-relaxed mb-6 max-w-md mx-auto">
                If your recycling bin is empty but you'd still like to support the mission,
                a direct donation goes just as far.
              </p>
              <button
                onClick={() => goDonate('secondary_section')}
                className="group inline-flex items-center gap-2.5 bg-chalkboard text-white pl-7 pr-2 py-2 rounded-full font-bold text-sm uppercase tracking-[0.18em] hover:bg-apple min-h-[48px]"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Make a Donation
                <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>
          </section>

          {/* ═══ 7. ABOUT ═══ */}
          <section className="mt-20 sm:mt-24 max-w-2xl mx-auto text-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl leading-tight tracking-[-0.01em] mb-4">
              Students supporting the teachers who support us.
            </h2>
            <p className="text-chalkboard/60 font-light leading-relaxed mb-6">
              Funding Michigan Teachers is a student-led 501(c)(3) nonprofit working to
              support educators, classrooms, and school communities — so no teacher pays
              out of pocket, and every teacher knows their work matters.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-bold text-apple hover:text-apple/75 underline underline-offset-4 min-h-[44px]"
            >
              Learn more about Funding Michigan Teachers →
            </button>
          </section>

          {/* ═══ 8. FAQ ═══ */}
          <section className="mt-20 sm:mt-24 max-w-2xl mx-auto">
            <h2 className="text-center font-serif font-bold text-3xl sm:text-4xl leading-tight tracking-[-0.01em] mb-8">
              Questions, <span className="text-apple italic font-normal">answered</span>.
            </h2>
            <FaqList />
          </section>

          {/* ═══ 9. FINAL CTA ═══ */}
          <section className="mt-20 sm:mt-24 max-w-3xl mx-auto text-center">
            <h2 className="font-serif font-bold text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em] mb-3">
              Your cans are worth more than{' '}
              <span className="relative inline-block text-apple">
                10¢
                <Scribble />
              </span>{' '}
              to a teacher.
            </h2>
            <p className="font-hand text-xl text-chalkboard/45 -rotate-1 mb-8">
              ready to turn them into something bigger?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => goToForm('final')}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-apple text-white pl-8 pr-2.5 py-2.5 rounded-full font-bold text-sm uppercase tracking-[0.18em] shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.98] min-h-[52px]"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Donate My Returnables
                <span className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-y-0.5 transition-transform">
                  <ArrowDown size={15} />
                </span>
              </button>
              <button
                onClick={() => goDonate('final')}
                className="w-full sm:w-auto flex items-center justify-center bg-white ring-1 ring-chalkboard/15 hover:ring-chalkboard/30 px-7 py-3 rounded-full font-bold text-sm uppercase tracking-[0.18em] text-chalkboard/70 hover:text-chalkboard min-h-[52px] transition-all"
              >
                Make a Monetary Donation
              </button>
            </div>

            <div className="flex items-end justify-center gap-2 mt-10" aria-hidden="true">
              <div className="w-9 h-9"><PopCan color="#E8564A" /></div>
              <div className="w-10 h-10"><Bottle color="#5EA9DD" /></div>
              <div className="w-8 h-8"><PopCan color="#4bbfb3" /></div>
              <ArrowRight size={18} className="text-chalkboard/25 mb-2" />
              <div className="w-16 h-14"><SchoolHouse /></div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FAQ — lightweight accordion
   ═══════════════════════════════════════════════════════════════════════ */
function FaqList() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2.5">
      {CAMPAIGN.faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="bg-white ring-1 ring-chalkboard/8 rounded-2xl overflow-hidden"
          >
            <h3>
              <button
                onClick={() => {
                  setOpen(isOpen ? null : i);
                  if (!isOpen) track('faq_opened', { question: item.q });
                }}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 min-h-[56px] hover:bg-chalkboard/[0.02] transition-colors"
              >
                <span className="font-bold text-sm sm:text-base text-chalkboard">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'text-chalkboard/40 shrink-0 transition-transform duration-300',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-chalkboard/65 font-light leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PICKUP FORM — the primary conversion.

   Built around access rather than address. The organization's stated risk
   is not "we don't know where you live", it's "we showed up and couldn't
   get the cans". So how we'll reach them is a required, load-bearing
   question with its own follow-ups, not a free-text afterthought.
   ═══════════════════════════════════════════════════════════════════════ */

const QUANTITIES = [
  'A grocery bag or two',
  'A few bags',
  'Several bags / a large collection',
  'A garage-full / very large pickup',
  'Not sure',
] as const;

const SPOTS = ['Front porch', 'Garage / driveway', 'Side of house', 'Other (noted below)'] as const;

type Access = 'leave-out' | 'someone-home' | 'coordinate';

const inputCls =
  'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-apple/25 focus:border-apple/40 outline-none transition-all placeholder:text-chalkboard/30 min-h-[48px]';
const labelCls = 'block text-[10px] uppercase tracking-[0.18em] font-bold text-chalkboard/45 mb-1.5';

function PickupForm({ source }: { source: string }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', zip: '',
    quantity: '' as string,
    access: '' as Access | '',
    spot: '' as string,
    homeTime: '',
    date: '', window: '', notes: '',
    deposit: false, newsletter: false,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [startedTracked, setStartedTracked] = useState(false);

  const set = (patch: Partial<typeof form>) => {
    if (!startedTracked) {
      track('returnables_form_started', { source });
      setStartedTracked(true);
    }
    setForm((f) => ({ ...f, ...patch }));
  };

  // Soft, non-blocking: a ZIP outside the service area gets a heads-up rather
  // than a rejection, since the org would rather hear from a near-miss than
  // silently turn them away.
  const zipOutOfArea =
    form.zip.length === 5 && !(CAMPAIGN.serviceZips as readonly string[]).includes(form.zip);

  const accessSummary =
    form.access === 'leave-out'
      ? `Leaving them out${form.spot ? ` — ${form.spot}` : ''}`
      : form.access === 'someone-home'
        ? `Someone will be home${form.homeTime ? ` — ${form.homeTime}` : ''}`
        : form.access === 'coordinate'
          ? 'Wants to coordinate first'
          : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    let submitted = false;

    const fullAddress = `${form.street}, ${form.city}, MI ${form.zip}`;

    if (await submitToFormBold(FORMBOLD.returnables, {
      Form: 'Returnables pickup request',
      subject: `Returnables pickup — ${form.name} (${form.city})`,
      'Contact Name': form.name,
      Phone: form.phone,
      Address: fullAddress,
      'Approx. Quantity': form.quantity,
      'How we get them': accessSummary,
      'Preferred Date': form.date,
      'Preferred Window': form.window,
      'Special Instructions': form.notes,
      'Newsletter Opt-In': form.newsletter ? 'Yes' : 'No',
      Source: source,
      email: form.email,
    })) submitted = true;

    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: form.notes,
        type: 'returnables',
        extra: {
          phone: form.phone,
          street: form.street,
          city: form.city,
          zip: form.zip,
          quantity: form.quantity,
          access: form.access,
          spot: form.spot,
          homeTime: form.homeTime,
          preferredDate: form.date,
          preferredWindow: form.window,
          newsletter: form.newsletter,
          source,
        },
      });
      if (!error) submitted = true;
    }

    if (!submitted) {
      // Last-resort fallback — open a prefilled email so no request is lost
      const subject = encodeURIComponent(`Returnables pickup — ${form.name} (${form.city})`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n` +
        `Address: ${fullAddress}\nQuantity: ${form.quantity}\n` +
        `How we get them: ${accessSummary}\n` +
        `Preferred: ${form.date} ${form.window}\n\nNotes: ${form.notes}\nSource: ${source}`,
      );
      window.open(`mailto:${CAMPAIGN.contactEmail}?subject=${subject}&body=${body}`);
    }

    track('returnables_form_submitted', { source, access: form.access, quantity: form.quantity });
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="max-w-2xl mx-auto bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-8 sm:p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
      >
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-apple/10 flex items-center justify-center">
          <CheckCircle2 size={26} className="text-apple" />
        </div>
        <h3 className="font-serif font-bold text-2xl mb-3 leading-tight">
          Your cans are officially on their way to helping a classroom 💛
        </h3>
        <p className="text-sm text-chalkboard/60 font-light leading-relaxed max-w-md mx-auto mb-6">
          We've got your request. Here's what happens next:
        </p>
        <ol className="text-left max-w-sm mx-auto space-y-3 mb-7">
          {[
            "We'll email you to confirm the day and time — nothing is scheduled until we've checked with you.",
            'Have them ready where you told us, or be around to hand them off.',
            'We pick them up, redeem them, and every dime goes to local teachers.',
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--color-campaign-teal)]/15 text-[var(--color-campaign-teal)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-chalkboard/70 font-light leading-snug">{line}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-chalkboard/40 font-light">
          Questions? <a href={`mailto:${CAMPAIGN.contactEmail}`} className="text-apple font-bold underline underline-offset-2">{CAMPAIGN.contactEmail}</a>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="max-w-2xl mx-auto bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
    >
      <div className="bg-white rounded-[calc(2rem-0.5rem)] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] space-y-6">

        {/* — You — */}
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rn-name" className={labelCls}>Your Name *</label>
              <input id="rn-name" required autoComplete="name" value={form.name}
                onChange={(e) => set({ name: e.target.value })} className={inputCls} placeholder="Alex Rivera" />
            </div>
            <div>
              <label htmlFor="rn-email" className={labelCls}>Email *</label>
              <input id="rn-email" required type="email" inputMode="email" autoComplete="email" value={form.email}
                onChange={(e) => set({ email: e.target.value })} className={inputCls} placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label htmlFor="rn-phone" className={labelCls}>Phone (optional — helps us reach you on pickup day)</label>
            <input id="rn-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone}
              onChange={(e) => set({ phone: e.target.value })} className={inputCls} placeholder="(517) 555-0100" />
          </div>
        </div>

        {/* — Where — */}
        <div className="pt-5 border-t border-chalkboard/8 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/35">
            Pickup address
          </p>
          <div>
            <label htmlFor="rn-street" className={labelCls}>Street Address *</label>
            <input id="rn-street" required autoComplete="address-line1" value={form.street}
              onChange={(e) => set({ street: e.target.value })} className={inputCls} placeholder="1234 Okemos Rd" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rn-city" className={labelCls}>City *</label>
              <input id="rn-city" required autoComplete="address-level2" value={form.city}
                onChange={(e) => set({ city: e.target.value })} className={inputCls} placeholder="Okemos" />
            </div>
            <div>
              <label htmlFor="rn-zip" className={labelCls}>ZIP Code *</label>
              <input id="rn-zip" required inputMode="numeric" autoComplete="postal-code" maxLength={5}
                pattern="[0-9]{5}" value={form.zip}
                onChange={(e) => set({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                className={inputCls} placeholder="48864" />
            </div>
          </div>
          {zipOutOfArea && (
            <p className="text-xs text-pencil-dark bg-pencil/10 ring-1 ring-pencil/25 rounded-xl px-4 py-2.5 leading-snug">
              Heads up — we usually pick up in {CAMPAIGN.serviceArea}. Send it anyway and
              we'll let you know what we can do.
            </p>
          )}
        </div>

        {/* — How much — */}
        <div className="pt-5 border-t border-chalkboard/8">
          <label htmlFor="rn-qty" className={labelCls}>Roughly how many returnables do you have?</label>
          <select id="rn-qty" value={form.quantity} onChange={(e) => set({ quantity: e.target.value })}
            className={cn(inputCls, 'appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238e9299\' stroke-width=\'2\'%3e%3cpath d=\'M6 9l6 6 6-6\'/%3e%3c/svg%3e")] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-11')}>
            <option value="">Choose one…</option>
            {QUANTITIES.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        {/* — ACCESS: the load-bearing question — */}
        <fieldset className="pt-5 border-t border-chalkboard/8">
          <legend className="text-sm font-bold text-chalkboard mb-1">How will we get them? *</legend>
          <p className="text-xs text-chalkboard/50 font-light leading-snug mb-3">
            This is the part that matters most — we want to make sure we can actually
            grab them when we come by.
          </p>
          <div className="space-y-2.5">
            {([
              ['leave-out', "I'll leave them out", "You don't need to be home"],
              ['someone-home', 'Someone will be home', "We'll hand them off in person"],
              ['coordinate', "I'd rather coordinate first", "Let's talk it through"],
            ] as const).map(([value, title, hint]) => (
              <label
                key={value}
                className={cn(
                  'flex items-start gap-3 rounded-xl px-4 py-3 ring-1 cursor-pointer transition-all min-h-[56px]',
                  form.access === value
                    ? 'bg-[var(--color-campaign-teal)]/8 ring-[var(--color-campaign-teal)]/40'
                    : 'bg-paper ring-chalkboard/10 hover:ring-chalkboard/20',
                )}
              >
                <input
                  type="radio" name="access" value={value} required
                  checked={form.access === value}
                  onChange={() => set({ access: value })}
                  className="mt-1 w-4 h-4 accent-[var(--color-campaign-teal)] shrink-0"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-chalkboard leading-snug">{title}</span>
                  <span className="block text-xs text-chalkboard/50 font-light">{hint}</span>
                </span>
              </label>
            ))}
          </div>

          {/* Conditional follow-ups */}
          <AnimatePresence initial={false}>
            {form.access === 'leave-out' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <label htmlFor="rn-spot" className={labelCls}>Where exactly will they be?</label>
                  <select id="rn-spot" value={form.spot} onChange={(e) => set({ spot: e.target.value })}
                    className={cn(inputCls, 'appearance-none pr-11')}>
                    <option value="">Choose a spot…</option>
                    {SPOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="mt-2.5 text-xs text-chalkboard/55 font-light leading-relaxed bg-paper ring-1 ring-chalkboard/8 rounded-xl px-4 py-3">
                    Please make sure they're easy for us to reach and not blocking the
                    sidewalk or street — and that leaving them out is OK under your HOA
                    or local rules.
                  </p>
                </div>
              </motion.div>
            )}
            {form.access === 'someone-home' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <label htmlFor="rn-hometime" className={labelCls}>When's a good time to come by?</label>
                  <input id="rn-hometime" value={form.homeTime}
                    onChange={(e) => set({ homeTime: e.target.value })}
                    className={inputCls} placeholder="Weekday evenings after 5, or Saturday morning" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </fieldset>

        {/* — When — */}
        <div className="pt-5 border-t border-chalkboard/8 grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rn-date" className={labelCls}>Preferred Date</label>
            <input id="rn-date" type="date" value={form.date}
              onChange={(e) => set({ date: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="rn-window" className={labelCls}>Preferred Time</label>
            <input id="rn-window" value={form.window}
              onChange={(e) => set({ window: e.target.value })} className={inputCls}
              placeholder="Morning, afternoon, evening…" />
          </div>
        </div>

        <div>
          <label htmlFor="rn-notes" className={labelCls}>Anything we should know? (optional)</label>
          <textarea id="rn-notes" rows={3} value={form.notes}
            onChange={(e) => set({ notes: e.target.value })} className={cn(inputCls, 'resize-none')}
            placeholder="Blue bags next to the garage. Gate code is 1234." />
        </div>

        {/* — Confirmations — */}
        <div className="pt-5 border-t border-chalkboard/8 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
            <input type="checkbox" required checked={form.deposit}
              onChange={(e) => set({ deposit: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-apple shrink-0" />
            <span className="text-sm text-chalkboard/75 font-light leading-snug">
              I confirm these are Michigan deposit-eligible returnable containers. *
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
            <input type="checkbox" checked={form.newsletter}
              onChange={(e) => set({ newsletter: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-apple shrink-0" />
            <span className="text-sm text-chalkboard/75 font-light leading-snug">
              Keep me updated about Funding Michigan Teachers.
            </span>
          </label>
        </div>

        {/* — Submit — */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="group w-full flex items-center justify-center gap-3 bg-apple text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-[0.18em] shadow-[0_15px_40px_rgba(192,57,43,0.3)] active:scale-[0.99] disabled:opacity-60 min-h-[56px] transition-all"
          >
            {status === 'loading' ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
            <span>Request My Pickup</span>
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs text-chalkboard/45 font-light leading-relaxed">
            <ShieldCheck size={14} className="text-[var(--color-campaign-teal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            We'll only use your information to coordinate this pickup and talk to you
            about this request. Your address is never shown publicly.
          </p>
        </div>
      </div>
    </motion.form>
  );
}
