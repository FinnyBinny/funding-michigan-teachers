import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, CalendarDays, Clock, GraduationCap, Megaphone, PartyPopper, Recycle, Sparkles, Users } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

/**
 * PREVIEW SCAFFOLD — not for release. Every <Draft> marks a place that waits
 * on the founder's details (what interns do, who can apply, commitment,
 * dates, what they get, the Google Form link). Nothing here is to ship
 * until each Draft is replaced with confirmed text.
 */
const FORM_URL = '#';

function Draft({ children, block = false }: { children: React.ReactNode; block?: boolean }) {
  const Tag = block ? 'div' : 'span';
  return (
    <Tag className={`${block ? 'block' : 'inline'} bg-pencil/15 outline-dashed outline-2 outline-pencil-dark/50 rounded px-1 text-chalkboard/80`}>
      {children}
    </Tag>
  );
}

const ROLES = [
  { icon: PartyPopper, title: 'Run events', body: <Draft>Waiting on you: what interns do at events</Draft> },
  { icon: Megaphone, title: 'Tell the story', body: <Draft>Waiting on you: social media, photos, writing?</Draft> },
  { icon: Recycle, title: 'Returnables', body: <Draft>Waiting on you: pickups and collection boxes?</Draft> },
  { icon: Users, title: 'Work with businesses', body: <Draft>Waiting on you: asking local businesses to sponsor?</Draft> },
];

const DETAILS = [
  { icon: GraduationCap, label: 'Who can apply', value: <Draft>Grades or ages, which schools</Draft> },
  { icon: Clock, label: 'Time', value: <Draft>Hours a week, for how long</Draft> },
  { icon: CalendarDays, label: 'Dates', value: <Draft>Apply by, starts on</Draft> },
  { icon: Sparkles, label: 'What you get', value: <Draft>Volunteer hours, a letter, a title?</Draft> },
];

export default function InternshipPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/internship'));
  }, []);

  const apply = (
    <a
      href={FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 bg-apple text-white pl-7 sm:pl-9 pr-2.5 py-3 rounded-full font-bold text-base sm:text-lg uppercase tracking-[0.1em] sm:tracking-[0.16em] whitespace-nowrap shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.98] min-h-[60px]"
    >
      Apply now
      <span className="w-10 h-10 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight size={17} aria-hidden="true" />
      </span>
      <span className="sr-only">(opens the application form in a new tab)</span>
    </a>
  );

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
              <Draft>Program name</Draft>
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-6 text-balance">
              Help run a nonprofit for <span className="text-apple italic font-normal">Michigan teachers</span>.
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed mb-8">
              <Draft>One or two sentences: who it's for and what you'll do. Waiting on your details.</Draft>
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {apply}
              <a href={`mailto:${EMAIL}?subject=Internship%20question`} className="text-base sm:text-lg font-bold text-chalkboard/75 hover:text-apple underline underline-offset-4 decoration-chalkboard/25 min-h-[44px] inline-flex items-center">
                Questions? Email us
              </a>
            </div>
          </motion.div>
        </section>

        {/* What interns do */}
        <section className="px-4 sm:px-6 py-12 bg-white/60" aria-labelledby="roles-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="roles-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-8 text-center">What interns do</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ROLES.map((r) => (
                <div key={r.title} className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6">
                  <div className="w-10 h-10 rounded-xl bg-apple/10 text-apple flex items-center justify-center mb-4">
                    <r.icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h3 className="font-sans font-bold text-base mb-1.5">{r.title}</h3>
                  <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The details */}
        <section className="px-4 sm:px-6 py-14" aria-labelledby="details-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="details-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-8">The details</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {DETAILS.map((d) => (
                <div key={d.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-campaign-teal)]/15 text-[var(--color-campaign-teal)] flex items-center justify-center shrink-0">
                    <d.icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-1">{d.label}</dt>
                    <dd className="text-base text-chalkboard/80 leading-snug">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How applying works */}
        <section className="px-4 sm:px-6 pb-14" aria-labelledby="steps-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="steps-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-6">How applying works</h2>
            <ol className="space-y-4">
              {[
                ['Fill out the form', 'It opens in Google Forms.'],
                [<Draft key="i">Interview?</Draft>, <Draft key="j">Waiting on you</Draft>],
                ['Hear back', <Draft key="k">By when?</Draft>],
              ].map(([title, body], i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="w-9 h-9 rounded-full bg-chalkboard text-white font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="pt-1">
                    <p className="font-bold text-chalkboard">{title}</p>
                    <p className="text-sm text-chalkboard/70 font-light">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-3xl mx-auto bg-chalkboard rounded-[2rem] p-8 sm:p-10 text-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-3">Ready to help?</h2>
            <p className="text-white/75 font-light mb-7">
              <Draft>Applications close on ⟨date⟩.</Draft>
            </p>
            {apply}
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
