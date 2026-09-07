import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, Mail, Heart } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const VALUES = [
  'Teachers are valued.',
  'No teacher pays out of pocket.',
  'Students lead.',
  'Every dollar stays in Michigan.',
];

const NUMBERS = [
  { value: '$15,000+', label: 'Raised for Michigan educators since 2023' },
  { value: '1,000+', label: 'Staff members reached during Teacher Appreciation Week' },
  { value: '9', label: 'Schools across Okemos, Haslett, and East Lansing' },
];

/** What FMT runs across a school year — the founder's actual calendar. */
const YEAR = [
  { when: 'Every month', what: 'Food at staff meetings, catered from local businesses.' },
  { when: 'October', what: 'Teacher of the Month, Halloween edition — custom boo baskets for two or three teachers every week.' },
  { when: 'November', what: 'Our founding anniversary. FMT started in November 2023.' },
  { when: 'December', what: 'Door decorating competition, plus a month-long school supply drive delivered when school resumes in January.' },
  { when: 'February', what: 'The Post Office of Love — students write letters to staff members and we deliver every one.' },
  { when: 'May', what: 'Teacher Appreciation Week: meals, meal cards, and events across all our partner schools.' },
  { when: 'June', what: 'End-of-year staff appreciation breakfast.' },
];

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'About Us | Funding Michigan Teachers',
      description:
        'Funding Michigan Teachers is a student-led 501(c)(3) founded in 2023 by Finn Regan in Okemos, Michigan. Our mission, our values, where the money goes, and what we run across the school year.',
      path: '/about',
    });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-14">
          <div className="pointer-events-none absolute top-0 left-0 w-[600px] h-[600px] bg-apple/[0.06] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-3xl mx-auto relative"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/50 mb-5">
              Student-Led · 501(c)(3) · Founded Okemos 2023
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-6">
              Michigan teachers give everything. <span className="text-apple italic font-normal">We give back.</span>
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed mb-4">
              Funding Michigan teachers so no educator pays out of pocket, and every educator knows
              their work matters.
            </p>
            <p className="font-hand text-2xl text-apple/80 -rotate-1">
              Teachers deserve better; let's make it happen.
            </p>
          </motion.div>
        </section>

        {/* Values */}
        <section className="px-4 sm:px-6 py-12 bg-white/60">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-7">What we stand for</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {VALUES.map((value) => (
                <div
                  key={value}
                  className="flex items-start gap-3 bg-white ring-1 ring-chalkboard/8 rounded-2xl px-5 py-4"
                >
                  <Check size={14} strokeWidth={3} className="text-apple shrink-0 mt-[3px]" />
                  <span className="text-sm text-chalkboard/80 font-medium leading-snug">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="px-4 sm:px-6 py-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-7">How it started</h2>
            <div className="space-y-5 text-chalkboard/70 leading-relaxed font-light text-lg">
              <p>
                Finn Regan grew up watching his mother work as a teacher — seeing firsthand how much
                time, effort, and personal money educators put into their classrooms without
                recognition. Beginning in elementary school, he and his friends would deliver coffee
                and donuts to school staff as a simple thank-you.
              </p>
              <p>
                That tradition continued through middle school and into high school. In November
                2023, during his freshman year, Finn decided to make it permanent. He founded
                Funding Michigan Teachers as a student-led nonprofit, bringing in community partners
                and donors to sustain and scale the effort year-round.
              </p>
              <p>
                Since then FMT has hosted two door decorating competitions awarding $500–$700 in
                prizes, delivered surprise staff meals from Chick-Fil-A, Dunkin', Nothing Bundt
                Cakes, and Hungry Howie's, run a student-written Valentine's Day letter campaign,
                and funded classroom grants — from a dissection lab at Okemos High School to
                greenhouse equipment for a life-science teacher.
              </p>
              <p>
                Every initiative is student-run, because Finn believes young people can make a real
                difference in their own communities.
              </p>
            </div>

            {/* Founder */}
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-6 bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-7">
              <div className="w-full sm:w-40 shrink-0 rounded-2xl overflow-hidden">
                <picture>
                  <source srcSet="/images/finn-and-mrs-freeman-1280.avif" type="image/avif" />
                  <img
                    src="/images/finn-and-mrs-freeman-1280.jpg"
                    alt="Finn Regan with Mrs. Freeman at Okemos High School"
                    width={1280}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-48 sm:h-40 object-cover object-top"
                  />
                </picture>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/50 mb-1.5">
                  Founder &amp; Executive Director
                </p>
                <h3 className="font-serif font-bold text-xl mb-2">Finn Regan</h3>
                <p className="text-sm text-chalkboard/70 leading-relaxed font-light">
                  Started FMT at 14 and still runs it as a high school student in Okemos. Pictured
                  with Mrs. Freeman — one of FMT's first and loudest supporters at Okemos High
                  School.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section className="px-4 sm:px-6 py-14 bg-chalkboard text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-8">Where we are today</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {NUMBERS.map((n) => (
                <div key={n.label}>
                  <p className="font-serif font-bold text-4xl text-pencil mb-2">{n.value}</p>
                  <p className="text-sm text-white/70 font-light leading-snug">{n.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Money */}
        <section className="px-4 sm:px-6 py-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-6">Where the money goes</h2>
            <div className="space-y-5 text-chalkboard/70 leading-relaxed font-light text-lg">
              <p>
                <strong className="text-chalkboard font-bold">At least 80¢ of every dollar</strong>{' '}
                goes directly to teachers and classrooms — food at staff meetings, classroom supply
                grants, appreciation events, and prizes. The rest covers card-processing fees and
                the basic costs of running a registered nonprofit.
              </p>
              <p>
                Nobody at FMT takes a salary. We are high school students, and we would rather tell
                you the real number than round it up to a hundred.
              </p>
              <p>
                We are a registered 501(c)(3) nonprofit,{' '}
                <span className="font-mono text-sm bg-chalkboard/5 px-2 py-0.5 rounded">EIN 93-4485967</span>,
                so donations are tax-deductible to the extent allowed by law. Every dollar we raise
                in Michigan stays in Michigan.
              </p>
            </div>
          </div>
        </section>

        {/* Year */}
        <section className="px-4 sm:px-6 py-14 bg-white/60">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-3">Our year</h2>
            <p className="text-chalkboard/60 font-light mb-8">
              What a school year with FMT looks like. Individual staff meetings and one-off events
              get added throughout the year.
            </p>
            <div className="space-y-3">
              {YEAR.map((row) => (
                <div
                  key={row.when}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 bg-white ring-1 ring-chalkboard/8 rounded-2xl px-5 py-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-apple w-full sm:w-32 shrink-0">
                    {row.when}
                  </p>
                  <p className="text-sm text-chalkboard/75 font-light leading-snug">{row.what}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-4">Want to be part of it?</h2>
            <p className="text-chalkboard/70 font-light mb-8 max-w-xl mx-auto">
              Give to a Michigan classroom, bring our programs to your school, or just say hello.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/donate')}
                className="group bg-apple text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-apple/90 transition-all active:scale-95 w-full sm:w-auto justify-center"
              >
                <Heart size={18} className="fill-current" />
                Donate to a teacher
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/for-schools')}
                className="bg-white ring-1 ring-chalkboard/10 text-chalkboard px-8 py-4 rounded-2xl font-bold hover:ring-apple/30 transition-all w-full sm:w-auto"
              >
                Bring FMT to your school
              </button>
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-chalkboard/60 hover:text-apple transition-colors"
            >
              <Mail size={14} />
              {EMAIL}
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
