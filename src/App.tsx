import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  BookOpen,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { setPageMeta } from './lib/seo';
import { metaForPath } from '../shared/pageMeta';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { navLinkProps } from './lib/navigate';
import { Button, ButtonTrailing } from './components/ui/button';
import DonationTiers from './components/DonationTiers';
import TeacherStories from './components/TeacherStories';
import EventCalendar from './components/EventCalendar';
import DonorWall from './components/DonorWall';
import ClassroomProjects from './components/ClassroomProjects';
import OurMission from './components/OurMission';
import Newsletter from './components/Newsletter';
import FAQAssistant from './components/FAQAssistant';
import DonationNudge from './components/DonationNudge';
import PastEvents from './components/PastEvents';
import { STAT } from './data/impactStats';
import Programs from './components/Programs';
import PartnerSchools from './components/PartnerSchools';

export default function App() {
  useEffect(() => {
    setPageMeta(metaForPath('/'));
  }, []);

  const handleDonate = (
    amount?: number,
    project?: { id?: number; title: string; teacher_name: string },
    frequency?: 'once' | 'monthly',
  ) => {
    // 3-click donation flow:
    //   1. Click "Donate" (anywhere on the site) — lands on /donate, which
    //      hosts the embedded Stripe checkout panel (card form renders
    //      inline, no redirect)
    //   2. Tap "Donate $X" — the embedded panel opens right there
    //   3. Apple Pay / Google Pay / card — Face ID or a few digits. Done.
    // A known amount is passed through as ?amount=X so /donate preselects it.
    // A project carries through as ?designation=project:<id>. The Worker
    // looks the id up itself before naming the project on the receipt, so
    // the title never has to travel in the URL.
    const q = new URLSearchParams();
    if (amount && amount > 0) q.set('amount', String(amount));
    if (project?.id) q.set('designation', `project:${project.id}`);
    if (frequency) q.set('frequency', frequency);
    const path = q.toString() ? `/donate?${q}` : '/donate';
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Sticky mobile donate bar reveals after the user scrolls past the hero
  const [showStickyDonate, setShowStickyDonate] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyDonate(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper selection:bg-pencil/30 overflow-x-hidden">
      <SiteHeader isHome />

      <main id="main">
        {/* Hero Section */}
        <section className="viewport-section hero-section pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden classroom-grid">
          {/* Ambient brand glows — atmospheric depth without the moving particles */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/[0.04] rounded-full blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-32 w-[500px] h-[500px] bg-pencil/[0.06] rounded-full blur-[120px]" />

          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-[2]">
            {/* The headline and intro are the first thing anyone (and Google's
                LCP measure) sees, so they paint at once and only slide:
                starting them at opacity 0 behind a blur held back the
                homepage's largest text by about 1.5s on a phone. */}
            <motion.div
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="lg:col-span-7"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
                className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-xl ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[0.625rem] font-bold mb-8 uppercase tracking-[0.24em] text-chalkboard/70 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-apple" />
                Student-Led · 501(c)(3) · Founded Okemos 2023
              </motion.div>
              <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.025em] mb-7 text-[clamp(2.5rem,4.6vw,4.5rem)]">
                Michigan teachers give everything.{' '}
                <span className="text-apple italic font-normal">We give back.</span>
              </h1>
              <p className="text-lg text-chalkboard/70 max-w-xl mb-10 leading-relaxed font-light text-pretty">
                Founded by Finn Regan at age 14 — because he grew up watching teachers spend their own money on classrooms while no one said thank you. We exist to change that.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                {/* Real links: the main action goes straight to /donate (it used
                    to scroll down the page), and crawlers can follow both. */}
                <Button asChild variant="primary" size="lg" className="group">
                  <a {...navLinkProps('/donate')}>
                    Donate to a Teacher
                    <ButtonTrailing dark>
                      <ArrowRight size={14} />
                    </ButtonTrailing>
                  </a>
                </Button>
                <Button asChild variant="outline" size="md">
                  <a {...navLinkProps('/about')}>Our Story</a>
                </Button>
              </div>
              <p className="mt-4 text-[0.6875rem] text-chalkboard/70 font-bold uppercase tracking-widest">
                501(c)(3) Nonprofit · EIN 93-4485967 · 80¢+ of every dollar to teachers
              </p>
              {/* Grid on mobile (hard 3-column constraint prevents horizontal
                  overflow from long uppercase labels); flex+dividers once
                  there's enough room at sm: and up. */}
              <div className="mt-10 grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6">
                <div className="flex flex-col min-w-0">
                  <span className="text-apple font-bold text-xl sm:text-2xl leading-none">{STAT.teachers.value}</span>
                  <span className="text-[0.625rem] sm:text-xs uppercase tracking-widest font-bold text-muted">{STAT.teachers.label}</span>
                </div>
                <div className="hidden sm:block w-px h-10 bg-chalkboard/10" />
                <div className="flex flex-col min-w-0">
                  <span className="text-ruler font-bold text-xl sm:text-2xl leading-none">{STAT.staff.value}</span>
                  <span className="text-[0.625rem] sm:text-xs uppercase tracking-widest font-bold text-muted">{STAT.staff.label}</span>
                </div>
                <div className="hidden sm:block w-px h-10 bg-chalkboard/10" />
                <div className="flex flex-col min-w-0">
                  <span className="text-pencil-dark font-bold text-xl sm:text-2xl leading-none">{STAT.partnerSchools.value}</span>
                  <span className="text-[0.625rem] sm:text-xs uppercase tracking-widest font-bold text-muted">{STAT.partnerSchools.label}</span>
                </div>
              </div>

              {/* Below 1024px the photo column is hidden, so phones saw no
                  photograph until 16 screens down. One compact copy here. */}
              <figure className="lg:hidden mt-9">
                <picture>
                  <source
                    media="(max-width: 1023.98px)"
                    type="image/avif"
                    srcSet="/images/finn-and-mrs-freeman-480.avif 480w, /images/finn-and-mrs-freeman-1280.avif 960w"
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                  <img
                    src="/images/finn-and-mrs-freeman-1280.jpg"
                    alt="Finn Regan with Mrs. Freeman at Okemos High School"
                    width={960}
                    height={1280}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[4/3] object-cover object-[50%_18%] rounded-[1.75rem] ring-1 ring-chalkboard/10"
                  />
                </picture>
                <figcaption className="mt-2.5 text-sm text-chalkboard/70">
                  Finn and Mrs. Freeman, one of FMT's first supporters at Okemos High School.
                </figcaption>
              </figure>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block lg:col-span-5"
            >
              {/* Real photo — Finn with Mrs. Freeman. The impact stats that
                  used to sit under this photo were the same three numbers
                  already shown in the left column, so the photo takes that
                  space instead. */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-chalkboard/5">
                {/* Both sources are desktop-only, matching the column. The
                    column is display:none on smaller screens, but that does
                    not stop an eager <img> downloading, so phones fetched a
                    175KB photo they never showed. Below 1024px the <img>
                    falls back to a 1px GIF instead. */}
                <picture>
                  <source media="(min-width: 1024px)" srcSet="/images/finn-and-mrs-freeman-1280.avif" type="image/avif" />
                  <source media="(min-width: 1024px)" srcSet="/images/finn-and-mrs-freeman-1280.jpg" />
                  <img
                    src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                    alt="Finn Regan with Mrs. Freeman at Okemos High School"
                    width={960}
                    height={1280}
                    className="w-full h-[540px] xl:h-[600px] object-cover object-top"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-chalkboard/75 via-chalkboard/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-white/70 text-[0.625rem] uppercase tracking-[0.2em] font-bold mb-1">Finn &amp; Mrs. Freeman · Okemos High School</p>
                  <p className="text-white font-serif text-2xl font-bold leading-tight">One of FMT's first and loudest supporters at OHS.</p>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-apple/5 rounded-full blur-[100px] -z-10" />
            </motion.div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section
          id="mission"
          className="viewport-section py-14 sm:py-16 md:py-18 px-4 sm:px-6 bg-white relative overflow-hidden"
        >
          <OurMission />
        </section>

        {/* Partner schools: the three buildings we work in, each a link to
            its own page. The map of everywhere we have delivered is on
            /schools. */}
        <section id="schools" className="py-14 sm:py-16 px-4 sm:px-6 bg-paper">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="font-serif font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05] tracking-tight mb-4 text-balance">
                Our <span className="text-apple italic font-normal">partner schools</span>.
              </h2>
              <p className="text-chalkboard/70 font-light leading-relaxed max-w-2xl">
                Three high schools, each with its own page — its own events, its own sponsors, and
                its own teachers telling us what their rooms ran out of.
              </p>
            </div>

            <PartnerSchools compact />

            <button
              onClick={() => { window.history.pushState({}, '', '/schools'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="mt-7 font-bold text-sm underline underline-offset-4 decoration-2 decoration-apple/40 hover:decoration-apple transition-colors"
            >
              All partner schools
            </button>
          </div>
        </section>

        {/* Teacher Stories Section */}
        <section
          id="stories"
          className="viewport-section py-14 sm:py-16 md:py-18 px-4 sm:px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-8 uppercase tracking-widest border border-apple/20"
              >
                <Sparkles size={14} />
                <span>Impact Stories</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Voices from the <span className="text-apple italic font-normal">Classroom</span>.
              </h2>
              <p className="text-base text-chalkboard/70 max-w-2xl mx-auto font-light leading-relaxed">
                In their own words: the teachers and staff at our partner schools.
              </p>
            </div>
            <TeacherStories />
          </div>
        </section>

        {/* Monthly giving tiers. After the proof (schools, a teacher's own
            words), not before it; the hero's Donate goes straight to /donate
            for anyone ready sooner. */}
        <section
          id="tiers"
          className="viewport-section py-14 sm:py-16 md:py-18 px-4 sm:px-6 relative overflow-hidden bg-paper"
        >
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-8 uppercase tracking-widest"
              >
                <Heart size={14} />
                <span>Monthly Support</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Choose Your <span className="text-apple italic font-normal">Impact</span>.
              </h2>
              <p className="text-base text-chalkboard/70 max-w-2xl mx-auto font-light leading-relaxed mb-6">
                Monthly giving is the most powerful way to support Michigan teachers — it lets us plan ahead, show up consistently, and make every staff meeting feel special.
              </p>
              <div className="inline-flex items-center gap-2 bg-chalkboard/5 text-chalkboard/70 px-4 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-pencil-dark" />
                2026–27 School Year Goal: $20,000
              </div>
            </div>
            {/* These are monthly giving tiers, so they open /donate on monthly;
                everything else opens on one-time. */}
            <DonationTiers onDonate={(a) => handleDonate(a, undefined, 'monthly')} />
          </div>
        </section>

        {/* Classroom Projects Section */}
        <section
          id="projects"
          className="viewport-section py-14 sm:py-16 md:py-18 px-4 sm:px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-8 uppercase tracking-widest border border-apple/20"
              >
                <BookOpen size={14} />
                <span>Classroom Initiatives</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Classroom <span className="text-apple italic font-normal">Projects</span>.
              </h2>
              <p className="text-base text-chalkboard/70 max-w-2xl mx-auto font-light leading-relaxed">
                Vote for the projects you believe in and help teachers reach their specific goals. Every vote brings them closer to a fully funded classroom.
              </p>
            </div>
            <ClassroomProjects onDonate={handleDonate} />
          </div>
        </section>

        {/* Ongoing programs. Sits just before the event calendar on purpose:
            these run all year, what follows has dates on it. */}
        <section id="programs" className="viewport-section py-14 sm:py-16 md:py-18 px-4 sm:px-6 bg-paper">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full">
            <Programs />
          </div>
        </section>

        {/* Event Calendar Section */}
        <section
          id="events"
          className="viewport-section py-14 sm:py-16 md:py-18 px-4 sm:px-6 bg-ruler/5 relative overflow-hidden"
        >
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-ruler/10 text-ruler px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-8 uppercase tracking-widest border border-ruler/20"
              >
                <Calendar size={14} aria-hidden="true" />
                <span>On the calendar</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Upcoming <span className="text-ruler italic font-normal">Events</span>.
              </h2>
              <p className="text-base text-chalkboard/70 max-w-2xl mx-auto font-light leading-relaxed">
                What's coming up at our partner schools, and everything we've done so far.
              </p>
            </div>
            <EventCalendar />
            <PastEvents />
          </div>
        </section>

        {/* Donor Wall Section */}
        <section
          id="donors"
          className="viewport-section py-14 sm:py-16 md:py-20 px-4 sm:px-6 bg-chalkboard text-white relative overflow-hidden"
        >
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <Heart size={14} />
                <span>Wall of Fame</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance text-white">
                Our <span className="text-pencil italic font-normal">Supporters</span>.
              </h2>
              <p className="text-base text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                A public thank you to the individuals and organizations making a difference in Michigan classrooms every single day.
              </p>
            </div>
            <DonorWall />
          </div>

          {/* Background Accents */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-apple/5 rounded-full blur-[120px] -z-0 -translate-x-1/2 -translate-y-1/2" />
        </section>

        {/* Newsletter Section */}
        <Newsletter />

      </main>

      {/* The same footer as every other page. The homepage had its own, with
          a column of same-page anchors and no Donate link, so the footer
          changed under you the moment you left the homepage. */}
      <SiteFooter />

      {/* FAQ Assistant */}
      <FAQAssistant />

      {/* 5-minute donation nudge */}
      <DonationNudge onDonate={() => handleDonate()} />

      {/* Mobile sticky donate ribbon — always-available conversion path on phones */}
      <AnimatePresence>
        {showStickyDonate && (
          <motion.button
            onClick={() => handleDonate()}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="donate-ribbon group flex items-center gap-3 bg-apple text-white pl-5 pr-1.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-[0.18em] shadow-[0_18px_40px_rgba(192,57,43,0.35)] active:scale-[0.98]"
          >
            <Heart size={13} strokeWidth={1.5} className="fill-current" />
            <span>Donate Now</span>
            <span className="w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight size={12} strokeWidth={1.5} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cinematic film-grain overlay — fixed, pointer-events-none, ultra-low opacity */}
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
