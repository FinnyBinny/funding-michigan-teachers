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
  Settings
} from 'lucide-react';
import { cn } from './lib/utils';
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
import AdminPanel from './components/AdminPanel';
import DonationModal from './components/DonationModal';
import PastEvents from './components/PastEvents';
import PrivacyPolicy from './components/PrivacyPolicy';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | undefined>(undefined);

  const handleDonate = (amount?: number) => {
    setDonationAmount(amount);
    setShowDonation(true);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Secret keyboard shortcut to open admin: Ctrl+Shift+A (or Cmd+Shift+A on Mac)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const navItems = ['Mission', 'Impact', 'Projects', 'Leaderboard', 'Events', 'Stories'];

  return (
    <div className="min-h-screen bg-paper selection:bg-pencil/30">
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
        <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden classroom-grid">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-pencil/20 text-ink px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 border border-pencil/30 uppercase tracking-widest">
                <Sparkles size={14} className="text-pencil-dark" />
                <span>Student-Led · Founded Okemos 2023</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[0.95] mb-6 text-balance">
                Michigan teachers give everything.<br />
                <span className="text-apple italic font-normal">We give back.</span>
              </h1>
              <p className="text-lg text-chalkboard/70 max-w-xl mb-8 leading-relaxed font-light">
                Founded by Finn Regan at age 14 — because he grew up watching teachers spend their own money on classrooms while no one said thank you. We exist to change that.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary"
                >
                  Donate to a Teacher <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-2xl font-bold text-base text-chalkboard/60 border border-chalkboard/15 hover:border-chalkboard/30 hover:text-chalkboard transition-all flex items-center gap-2"
                >
                  Our Story
                </button>
              </div>
              <p className="mt-4 text-[11px] text-chalkboard/40 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
                501(c)(3) Nonprofit · EIN 93-4485967 · 100% to teachers
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-apple font-bold text-2xl leading-none">1,200+</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Teachers Impacted</span>
                </div>
                <div className="w-px h-10 bg-chalkboard/10" />
                <div className="flex flex-col">
                  <span className="text-ruler font-bold text-2xl leading-none">$4,000+</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Raised Overall</span>
                </div>
                <div className="w-px h-10 bg-chalkboard/10" />
                <div className="flex flex-col">
                  <span className="text-pencil font-bold text-2xl leading-none">3</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Schools Reached</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
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

              {/* Real fundraising progress */}
              <div className="mt-5 bg-white rounded-[2rem] p-7 shadow-xl border border-chalkboard/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">2025–26 Goal Progress</p>
                  <span className="text-apple font-mono font-bold">40%</span>
                </div>
                <div className="w-full h-3 bg-chalkboard/5 rounded-full overflow-hidden my-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ duration: 1.8, delay: 0.8, ease: "easeOut" }}
                    className="h-full bg-apple rounded-full"
                  />
                </div>
                <div className="flex justify-between items-end min-w-0 gap-2">
                  <div className="min-w-0">
                    <p className="text-xl font-bold font-mono text-chalkboard leading-none">$4,000+</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">raised so far</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold font-mono text-chalkboard/30 leading-none">$10,000</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">school year goal</p>
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
          className="py-12 sm:py-16 px-4 sm:px-6 bg-white relative overflow-hidden"
        >
          <OurMission />
        </section>

        {/* Donation Tiers Section — placed early so warm visitors can convert immediately */}
        <section
          id="tiers"
          className="py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden bg-paper"
        >
          <div className="max-w-7xl mx-auto">
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
              <p className="text-base text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Monthly giving is the most powerful way to support Michigan teachers — it lets us plan ahead, show up consistently, and make every staff meeting feel special.
              </p>
            </div>
            <DonationTiers onDonate={handleDonate} />
          </div>
        </section>

        {/* Impact Map Section */}
        <section
          id="impact"
          className="py-12 sm:py-16 px-4 sm:px-6 bg-chalkboard text-white overflow-hidden relative"
        >
          <div className="max-w-7xl mx-auto">
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
          className="py-12 sm:py-16 px-4 sm:px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
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
          className="py-12 sm:py-16 px-4 sm:px-6 bg-apple/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
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
          className="py-12 sm:py-16 px-4 sm:px-6 bg-ruler/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
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
          className="py-16 md:py-32 px-6 bg-chalkboard text-white relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
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
          className="py-12 sm:py-16 px-4 sm:px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
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
        <section id="contact" className="py-12 sm:py-16 px-4 sm:px-6 bg-paper">
          <div className="max-w-7xl mx-auto">
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

      {/* Admin Button — hidden in production; re-enable by removing 'hidden' class */}
      <motion.button
        onClick={() => setShowAdmin(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        title="Open Admin Panel"
        className="hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-chalkboard text-white px-4 py-2.5 rounded-2xl shadow-xl hover:bg-apple transition-all hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-widest"
      >
        <Settings size={15} />
        Admin
      </motion.button>

      {/* Admin Panel */}
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        amount={donationAmount}
        frequency="monthly"
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
