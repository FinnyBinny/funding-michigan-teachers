import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  ChevronRight,
  BookOpen,
  MapPin,
  Trophy,
  Calendar,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { cn } from './lib/utils';
import { Button, ButtonTrailing } from './components/ui/button';
import MichiganMap from './components/MichiganMap';
import DonationTiers from './components/DonationTiers';
import TeacherStories from './components/TeacherStories';
import EventCalendar from './components/EventCalendar';
import DonorWall from './components/DonorWall';
import ClassroomProjects from './components/ClassroomProjects';
import TeacherLeaderboard from './components/TeacherLeaderboard';
import OurMission from './components/OurMission';
import Newsletter from './components/Newsletter';
import ContactForm from './components/ContactForm';
import FAQAssistant from './components/FAQAssistant';
import DonationModal from './components/DonationModal';
import DonationNudge from './components/DonationNudge';
import PastEvents from './components/PastEvents';
import PrivacyPolicy from './components/PrivacyPolicy';
import { openDonation } from './lib/donate';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | undefined>(undefined);

  const handleDonate = (amount?: number) => {
    // 3-click donation flow:
    //   1. Click "Donate" (or pick a tier) — we open Stripe Checkout in a new tab
    //   2. On Checkout, tap Apple Pay / Google Pay
    //   3. Confirm with Face ID / Touch ID — done.
    // If a specific amount is known we open Stripe directly, skipping the /donate page entirely.
    // For generic "Donate Now" with no amount yet, route to /donate so the user picks a tile.
    if (amount && amount > 0) {
      openDonation({ amount, frequency: 'monthly' });
    } else {
      window.history.pushState({}, '', '/donate');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setDonationAmount(amount);
  };

  // Sticky mobile donate bar reveals after the user scrolls past the hero
  const [showStickyDonate, setShowStickyDonate] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyDonate(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Mission', 'Impact', 'Projects', 'Leaderboard', 'Events', 'Stories'];

  return (
    <div className="min-h-screen bg-paper selection:bg-pencil/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,box-shadow] duration-300 px-6 py-4",
        scrolled ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg transform -rotate-3 transition-transform group-hover:rotate-0 shrink-0">
              <img src="/images/fmt-logo-lc.png" alt="Funding Michigan Teachers" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base sm:text-xl font-bold tracking-tight leading-none truncate">Funding Michigan Teachers</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted hidden sm:block">Student-Led Nonprofit</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 font-medium text-xs uppercase tracking-[0.15em]">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-apple transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-apple transition-all group-hover:w-full" />
              </a>
            ))}
            <button
              onClick={() => handleDonate()}
              className="bg-chalkboard text-white px-8 py-2.5 rounded-full hover:bg-apple transition-all hover:scale-105 active:scale-95 shadow-lg font-bold cursor-pointer"
            >
              Donate Now
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-chalkboard/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl pt-24 pb-8 px-6 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold uppercase tracking-widest hover:text-apple transition-colors py-2 border-b border-chalkboard/5"
                >
                  {item}
                </a>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); handleDonate(); }}
                className="mt-4 bg-apple text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-apple/90 transition-all cursor-pointer"
              >
                Donate Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="viewport-section pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden classroom-grid">
          {/* Ambient brand glows — atmospheric depth without the moving particles */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/[0.04] rounded-full blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-32 w-[500px] h-[500px] bg-pencil/[0.06] rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-[2]">
            <motion.div
              initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
              className="lg:col-span-7"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
                className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-xl ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-8 uppercase tracking-[0.24em] text-chalkboard/70 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-apple animate-pulse" />
                Student-Led · 501(c)(3) · Founded Okemos 2023
              </motion.div>
              <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.025em] mb-7 text-[clamp(2.5rem,4.6vw,4.5rem)]">
                Michigan teachers give everything.{' '}
                <span className="text-apple italic font-normal">We give back.</span>
              </h1>
              <p className="text-lg text-chalkboard/65 max-w-xl mb-10 leading-relaxed font-light text-pretty">
                Founded by Finn Regan at age 14 — because he grew up watching teachers spend their own money on classrooms while no one said thank you. We exist to change that.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  variant="primary"
                  size="lg"
                  className="group"
                  onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Donate to a Teacher
                  <ButtonTrailing dark>
                    <ArrowRight size={14} />
                  </ButtonTrailing>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Our Story
                </Button>
              </div>
              <p className="mt-4 text-[11px] text-chalkboard/40 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
                501(c)(3) Nonprofit · EIN 93-4485967 · 100% to teachers
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-apple font-bold text-2xl leading-none">1,000+</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Educators Reached</span>
                </div>
                <div className="w-px h-10 bg-chalkboard/10" />
                <div className="flex flex-col">
                  <span className="text-ruler font-bold text-2xl leading-none">$15K+</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Raised Overall</span>
                </div>
                <div className="w-px h-10 bg-chalkboard/10" />
                <div className="flex flex-col">
                  <span className="text-pencil font-bold text-2xl leading-none">9</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Schools Supported</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block lg:col-span-5"
            >
              {/* Real photo — Finn with Mrs. Freeman */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-chalkboard/5">
                <img
                  src="/images/finn-and-mrs-freeman-opt.jpg"
                  alt="Finn Regan with Mrs. Freeman at Okemos High School"
                  className="w-full h-[400px] object-cover object-top"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chalkboard/75 via-chalkboard/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Finn & Mrs. Freeman · Okemos High School</p>
                  <p className="text-white font-serif text-xl font-bold leading-tight">One of FMT's first and loudest supporters at OHS.</p>
                </div>
              </div>

              {/* All-time impact card */}
              <div className="mt-5 bg-white rounded-[2rem] p-7 shadow-xl border border-chalkboard/5">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted mb-4">Impact to Date</p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold font-mono text-apple leading-none">$15K+</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1.5">raised</p>
                  </div>
                  <div className="w-px h-10 bg-chalkboard/10" />
                  <div>
                    <p className="text-2xl font-bold font-mono text-chalkboard leading-none">1,000+</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1.5">educators</p>
                  </div>
                  <div className="w-px h-10 bg-chalkboard/10" />
                  <div>
                    <p className="text-2xl font-bold font-mono text-ruler leading-none">9</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1.5">schools</p>
                  </div>
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
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-white relative overflow-hidden"
        >
          <OurMission />
        </section>

        {/* Donation Tiers Section — placed early so warm visitors can convert immediately */}
        <section
          id="tiers"
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-paper"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest"
              >
                <Heart size={14} />
                <span>Monthly Support</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Choose Your <span className="text-apple italic font-normal">Impact</span>.
              </h2>
              <p className="text-base text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed mb-6">
                Monthly giving is the most powerful way to support Michigan teachers — it lets us plan ahead, show up consistently, and make every staff meeting feel special.
              </p>
              <div className="inline-flex items-center gap-2 bg-chalkboard/5 text-chalkboard/60 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-pencil-dark" />
                2026–27 School Year Goal: $20,000
              </div>
            </div>
            <DonationTiers onDonate={handleDonate} />
          </div>
        </section>

        {/* Impact Map Section */}
        <section
          id="impact"
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-chalkboard text-white overflow-hidden relative"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <MapPin size={14} />
                <span>Statewide Reach</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance text-white">
                Our Impact Across <span className="text-pencil italic font-normal">Michigan</span>.
              </h2>
              <p className="text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
                Explore the schools and districts we've supported. Every dot represents a classroom transformed by your generosity.
              </p>
            </div>
            <MichiganMap />
          </div>

          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-apple/5 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ruler/5 rounded-full blur-[100px] -z-0 -translate-x-1/2 translate-y-1/2" />
        </section>

        {/* Classroom Projects Section */}
        <section
          id="projects"
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-apple/20"
              >
                <BookOpen size={14} />
                <span>Classroom Initiatives</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Classroom <span className="text-apple italic font-normal">Projects</span>.
              </h2>
              <p className="text-base text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Vote for the projects you believe in and help teachers reach their specific goals. Every vote brings them closer to a fully funded classroom.
              </p>
            </div>
            <ClassroomProjects onDonate={handleDonate} />
          </div>
        </section>

        {/* Teacher Leaderboard Section */}
        <section
          id="leaderboard"
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-apple/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-ink px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <Trophy size={14} />
                <span>Excellence in Education</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Teacher <span className="text-pencil italic font-normal">Leaderboard</span>.
              </h2>
              <p className="text-base text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Recognizing the incredible engagement and dedication of our Michigan educators who go above and beyond for their students.
              </p>
            </div>
            <TeacherLeaderboard />
          </div>
        </section>

        {/* Event Calendar Section */}
        <section
          id="events"
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-ruler/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-ruler/10 text-ruler px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-ruler/20"
              >
                <Calendar size={14} />
                <span>Community Engagement</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Upcoming <span className="text-ruler italic font-normal">Events</span>.
              </h2>
              <p className="text-base text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Join us for fundraisers, teacher appreciation days, and community showcases that celebrate the impact of education.
              </p>
            </div>
            <EventCalendar />
            <PastEvents />
          </div>
        </section>

        {/* Donor Wall Section */}
        <section
          id="donors"
          className="viewport-section py-20 sm:py-24 md:py-32 px-4 sm:px-6 bg-chalkboard text-white relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <Heart size={14} />
                <span>Wall of Fame</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance text-white">
                Our <span className="text-pencil italic font-normal">Supporters</span>.
              </h2>
              <p className="text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
                A public thank you to the individuals and organizations making a difference in Michigan classrooms every single day.
              </p>
            </div>
            <DonorWall />
          </div>

          {/* Background Accents */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-apple/5 rounded-full blur-[120px] -z-0 -translate-x-1/2 -translate-y-1/2" />
        </section>

        {/* Teacher Stories Section */}
        <section
          id="stories"
          className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-apple/20"
              >
                <Sparkles size={14} />
                <span>Impact Stories</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-balance">
                Voices from the <span className="text-apple italic font-normal">Classroom</span>.
              </h2>
              <p className="text-base text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Real stories from educators whose classrooms were changed by your generosity. Every story is a testament to the power of community.
              </p>
            </div>
            <TeacherStories />
          </div>
        </section>

        {/* Newsletter Section */}
        <Newsletter />

        {/* Contact Section */}
        <section id="contact" className="viewport-section py-20 sm:py-24 px-4 sm:px-6 bg-paper">
          <div className="max-w-7xl mx-auto w-full">
            <ContactForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="bg-chalkboard text-white py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl rotate-3 shrink-0">
                  <img src="/images/fmt-logo-lc.png" alt="Funding Michigan Teachers" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
                <span className="font-serif text-xl sm:text-3xl font-bold tracking-tight">Funding Michigan Teachers</span>
              </div>
              <p className="text-white/50 max-w-md mb-10 text-lg font-light leading-relaxed">
                A student-led 501(c)(3) nonprofit organization dedicated to empowering Michigan's educators and transforming classrooms through community support.
              </p>
              <div className="flex gap-6">
                <a href="https://www.facebook.com/fundingmichiganteachers" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-apple transition-colors text-sm font-bold uppercase tracking-widest">Facebook</a>
                <a href="https://www.instagram.com/fundingmichiganteachers" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-apple transition-colors text-sm font-bold uppercase tracking-widest">Instagram</a>
                <a href="https://www.linkedin.com/company/funding-michigan-teachers" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-apple transition-colors text-sm font-bold uppercase tracking-widest">LinkedIn</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-[10px] text-pencil">Navigation</h4>
              <ul className="space-y-5 text-white/60 font-medium">
                <li><a href="#mission" className="hover:text-white transition-colors">Our Mission</a></li>
                <li><a href="#impact" className="hover:text-white transition-colors">Impact Map</a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">Classroom Projects</a></li>
                <li><a href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="/sponsors" className="hover:text-white transition-colors">Corporate Sponsors</a></li>
                <li><a href="/for-schools" className="hover:text-white transition-colors inline-flex items-center gap-2">For Schools <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-apple bg-apple/10 px-1.5 py-0.5 rounded-full">New</span></a></li>
                <li><a href="#donors" className="hover:text-white transition-colors">Supporter Wall</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-[10px] text-pencil">Connect</h4>
              <ul className="space-y-5 text-white/60 font-medium">
                <li>Okemos, Michigan</li>
                <li><a href="mailto:hello@fundingmichiganteachers.org" className="hover:text-white transition-colors">hello@fundingmichiganteachers.org</a></li>
                <li className="pt-6">
                  <button
                    onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-apple text-white px-10 py-4 rounded-2xl hover:bg-white hover:text-apple transition-all font-bold shadow-2xl flex items-center gap-3 group"
                  >
                    <Heart size={20} className="fill-current group-hover:scale-110 transition-transform" />
                    <span>Support a Teacher</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-xs">
            <div className="flex items-center gap-8">
              <span>&copy; {new Date().getFullYear()} Funding Michigan Teachers</span>
              <span className="font-mono uppercase tracking-widest text-[9px] px-3 py-1 bg-white/5 rounded-full">EIN: 93-4485967</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy Policy</button>
            </div>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-apple/5 rounded-full blur-[150px] -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ruler/5 rounded-full blur-[100px] -z-0 -translate-x-1/2 translate-y-1/2" />
      </footer>

      {/* FAQ Assistant */}
      <FAQAssistant />

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        amount={donationAmount}
        frequency="monthly"
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

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
