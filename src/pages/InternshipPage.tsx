import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight, CalendarDays, Clock, Award, Users, Camera, ClipboardList, Handshake, HeartHandshake,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { track } from '../lib/analytics';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
// Internship questions go straight to the program supervisor, Finn Regan.
const EMAIL = 'finn@fundingmichiganteachers.org';

/**
 * The Youth Internship Program, for students who want to apply.
 *
 * Everything here comes from the program handbook (Internship Overview,
 * 2026–27). That handbook is internal, so this page carries only what an
 * applicant needs: the three positions, the commitment, the dates, what
 * interns get, and what happens after applying. Left out on purpose: the
 * internal goals and metrics, the work-log and sign-off process, the
 * strategic plans, and anyone's phone number.
 *
 * Applications go to a Google Form, so nothing is collected on this site;
 * the privacy policy says so.
 */
const INTERNSHIP_FORM_URL = 'GOOGLE_FORM_URL';

const POSITIONS = [
  {
    icon: Camera,
    title: 'Digital Story Architect',
    body: "Grows FMT's digital presence: 3 to 5 posts a week across Instagram, Facebook, TikTok and LinkedIn, short-form video, event coverage, and donor thank-yous, plus answering comments and messages. Original work only, focused on real impact.",
  },
  {
    icon: ClipboardList,
    title: 'Operations Coordinator',
    body: 'Keeps the organization running: Google Workspace, scheduling meetings and events, answering donation and teacher emails, keeping records of events and donations, updating website content, and writing up every event.',
  },
  {
    icon: Handshake,
    title: 'Community Outreach Representative',
    body: 'Builds relationships with teachers, administrators and school boards in one community (Okemos, Haslett, East Lansing or Lansing, where available) and helps run events there.',
  },
];

const DETAILS = [
  { icon: CalendarDays, label: 'Program dates', value: 'October 3, 2026 to June 5, 2027, about 35 weeks' },
  { icon: Clock, label: 'Time', value: 'About 5 hours a week (3 at minimum), with a team check-in every two weeks' },
  { icon: Award, label: 'What you get', value: 'About 175 community service hours, confirmed at the end, and real leadership experience' },
  { icon: Users, label: 'Where it leads', value: 'A path to our youth board of directors' },
];

const LOOK_FOR = [
  'Reliable and consistent',
  'Willing to take initiative',
  'Passionate about education and teachers',
  'Comfortable working on a team',
  'Able to follow through',
];

const VALUES = [
  {
    title: 'Initiative over excuses',
    body: "FMT started with Finn Regan, in first grade, using lawn-care and birthday money to buy coffee and donuts for his elementary school's staff. When you have an idea, you work to make it real.",
  },
  {
    title: 'Quality over quantity',
    body: 'We grow deep roots in each community we serve rather than spreading fast, so teachers there feel supported.',
  },
  {
    title: 'Mission over résumé-building',
    body: 'We want people who genuinely want to be teachers’ biggest cheerleaders, not just a line on an application.',
  },
];

function ApplyButton({ where }: { where: string }) {
  return (
    <a
      href={INTERNSHIP_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('internship_apply_clicked', { location: where })}
      className="group inline-flex items-center justify-center gap-3 bg-apple text-white pl-7 sm:pl-9 pr-2.5 py-3 rounded-full font-bold text-base sm:text-lg uppercase tracking-[0.1em] sm:tracking-[0.16em] whitespace-nowrap shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.98] min-h-[60px]"
    >
      Apply now
      <span className="w-10 h-10 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight size={17} aria-hidden="true" />
      </span>
      <span className="sr-only">(opens the application in Google Forms, in a new tab)</span>
    </a>
  );
}

export default function InternshipPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/internship'));
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main id="main" className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-12">
          <div className="pointer-events-none absolute top-0 right-0 w-[560px] h-[560px] bg-apple/[0.06] rounded-full blur-[140px] translate-x-1/3 -translate-y-1/4" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-3xl mx-auto relative"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-5">
              Youth Internship Program · 2026–27
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-6 text-balance">
              Help run a nonprofit for <span className="text-apple italic font-normal">Michigan teachers</span>.
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed mb-8">
              A real operational role, not a passive internship. Students tell our story, keep the
              organization running, and build partnerships with local schools, about 5 hours a
              week from October to June.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <ApplyButton where="hero" />
              <a href={`mailto:${EMAIL}?subject=Youth%20Internship%20question`} className="text-base sm:text-lg font-bold text-chalkboard/75 hover:text-apple underline underline-offset-4 decoration-chalkboard/25 min-h-[44px] inline-flex items-center">
                Questions? Email Finn
              </a>
            </div>
          </motion.div>
        </section>

        {/* The details */}
        <section className="px-4 sm:px-6 pb-12" aria-labelledby="details-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="details-heading" className="sr-only">The details</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-6 bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-8">
              {DETAILS.map((d) => (
                <li key={d.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-campaign-teal)]/15 text-[var(--color-campaign-teal)] flex items-center justify-center shrink-0">
                    <d.icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p>
                    <span className="block text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-1">{d.label}</span>
                    <span className="block text-base text-chalkboard/80 leading-snug">{d.value}</span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-chalkboard/70 font-light leading-relaxed">
              Unpaid and voluntary. Interns under 18 need a parent or guardian to sign the acceptance
              form with them.
            </p>
          </div>
        </section>

        {/* The three positions */}
        <section className="px-4 sm:px-6 py-14 bg-white/60" aria-labelledby="positions-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="positions-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-2 text-center">Three positions, one team</h2>
            <p className="text-center text-chalkboard/70 font-light mb-9 max-w-2xl mx-auto">
              Every role supports the others: outreach builds the relationships, operations keeps
              everything organized, and storytelling shows the impact.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {POSITIONS.map((p) => (
                <div key={p.title} className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-7">
                  <div className="w-11 h-11 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mb-4">
                    <p.icon size={20} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h3 className="font-serif font-bold text-xl leading-tight mb-2">{p.title}</h3>
                  <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who we look for, and how we work */}
        <section className="px-4 sm:px-6 py-14" aria-labelledby="fit-heading">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14">
            <div>
              <h2 id="fit-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-5">Who we look for</h2>
              <ul className="space-y-3">
                {LOOK_FOR.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-chalkboard/80">
                    <HeartHandshake size={18} strokeWidth={1.6} className="text-apple shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-chalkboard/70 font-light leading-relaxed">
                Every intern commits to the check-ins every two weeks, communicates professionally,
                meets deadlines and owns their work.
              </p>
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-5">How we work</h2>
              <div className="space-y-5">
                {VALUES.map((v) => (
                  <div key={v.title}>
                    <h3 className="font-sans font-bold text-base text-chalkboard mb-1">{v.title}</h3>
                    <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{v.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How applying works */}
        <section className="px-4 sm:px-6 pb-14" aria-labelledby="steps-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="steps-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-6">How applying works</h2>
            <ol className="space-y-5">
              {[
                ['Apply', 'Fill out the application. It opens in Google Forms.'],
                ['If you’re selected', 'You get the program handbook and sign an acceptance form. Under 18? A parent or guardian signs too.'],
                ['Get started', 'Onboarding, your position, and your first team check-in.'],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4 items-start">
                  <span className="w-9 h-9 rounded-full bg-chalkboard text-white font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="pt-1">
                    <p className="font-bold text-chalkboard">{title}</p>
                    <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-3xl mx-auto bg-chalkboard rounded-[2rem] p-8 sm:p-10 text-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-3">Ready to help teachers?</h2>
            <p className="text-white/75 font-light mb-7">
              October 3, 2026 to June 5, 2027 · about 5 hours a week · about 175 service hours
            </p>
            <ApplyButton where="closing" />
            <p className="mt-6 text-sm text-white/70">
              Questions about the program? Email Finn at{' '}
              <a href={`mailto:${EMAIL}?subject=Youth%20Internship%20question`} className="underline underline-offset-2 hover:text-white">{EMAIL}</a>.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
