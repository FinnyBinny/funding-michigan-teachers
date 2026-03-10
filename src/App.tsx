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
  X
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

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Mission', 'Impact', 'Projects', 'Leaderboard', 'Events', 'Stories'];

  return (
    <div className="min-h-screen bg-paper selection:bg-pencil/30">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-apple rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-3 transition-transform group-hover:rotate-0">
              <BookOpen size={28} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight leading-none">Funding Michigan Teachers</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Student-Led Nonprofit</span>
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
              onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-chalkboard text-white px-8 py-2.5 rounded-full hover:bg-apple transition-all hover:scale-105 active:scale-95 shadow-lg font-bold"
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 bg-apple text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-apple/90 transition-all"
              >
                Donate Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-32 px-6 overflow-hidden classroom-grid">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-pencil/20 text-ink px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 border border-pencil/30 uppercase tracking-widest">
                <Sparkles size={14} className="text-pencil-dark" />
                <span>Student-Led Excellence</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-serif font-bold leading-[0.85] mb-8 text-balance">
                Funding the <span className="text-apple italic font-normal">Future</span> of Michigan.
              </h1>
              <p className="text-xl text-chalkboard/70 max-w-xl mb-10 leading-relaxed font-light">
                We're a student-led nonprofit dedicated to providing Michigan teachers with the resources they need to inspire the next generation.
              </p>
              <div className="flex flex-wrap gap-5">
                <button
                  onClick={() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary"
                >
                  Start Supporting <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-secondary"
                >
                  Our Mission
                </button>
              </div>
              <div className="mt-16 flex items-center gap-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <img
                      key={i}
                      src={`https://picsum.photos/seed/teacher${i}/100/100`}
                      className="w-14 h-14 rounded-2xl border-4 border-paper shadow-md object-cover"
                      alt="Supporter"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-apple font-bold text-2xl leading-none">600+</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-muted">Teachers Impacted</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white p-5 rounded-[40px] shadow-2xl border border-chalkboard/5 transform rotate-2">
                <div className="overflow-hidden rounded-[32px]">
                  <img
                    src="https://picsum.photos/seed/michigan-classroom/800/500"
                    className="w-full h-auto hover:scale-105 transition-transform duration-700"
                    alt="Michigan Classroom"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="absolute -bottom-10 -left-10 bg-ruler text-white p-8 rounded-3xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Live Impact</span>
                  </div>
                  <div className="text-4xl font-bold font-mono">Over $4,000.00</div>
                </div>

                <div className="absolute -top-10 -right-10 bg-pencil text-chalkboard p-8 rounded-3xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="text-4xl font-bold font-mono">25%</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mt-1">Goal Reached</div>
                  <div className="w-full h-1.5 bg-chalkboard/10 rounded-full mt-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '25%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-chalkboard"
                    />
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-apple/5 rounded-full blur-[120px] -z-10" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-ruler/5 rounded-full blur-[100px] -z-10" />
            </motion.div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section
          id="mission"
          className="py-32 px-6 bg-white relative overflow-hidden"
        >
          <OurMission />
        </section>

        {/* Impact Map Section */}
        <section
          id="impact"
          className="py-32 px-6 bg-chalkboard text-white overflow-hidden relative"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <MapPin size={14} />
                <span>Statewide Reach</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance text-white">
                Our Impact Across <span className="text-pencil italic font-normal">Michigan</span>.
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
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
          className="py-32 px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-apple/20"
              >
                <BookOpen size={14} />
                <span>Classroom Initiatives</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance">
                Classroom <span className="text-apple italic font-normal">Projects</span>.
              </h2>
              <p className="text-xl text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Vote for the projects you believe in and help teachers reach their specific goals. Every vote brings them closer to a fully funded classroom.
              </p>
            </div>
            <ClassroomProjects />
          </div>
        </section>

        {/* Teacher Leaderboard Section */}
        <section
          id="leaderboard"
          className="py-32 px-6 bg-apple/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-ink px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <Trophy size={14} />
                <span>Excellence in Education</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance">
                Teacher <span className="text-pencil italic font-normal">Leaderboard</span>.
              </h2>
              <p className="text-xl text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Recognizing the incredible engagement and dedication of our Michigan educators who go above and beyond for their students.
              </p>
            </div>
            <TeacherLeaderboard />
          </div>
        </section>

        {/* Event Calendar Section */}
        <section
          id="events"
          className="py-32 px-6 bg-ruler/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-ruler/10 text-ruler px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-ruler/20"
              >
                <Calendar size={14} />
                <span>Community Engagement</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance">
                Upcoming <span className="text-ruler italic font-normal">Events</span>.
              </h2>
              <p className="text-xl text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Join us for fundraisers, teacher appreciation days, and community showcases that celebrate the impact of education.
              </p>
            </div>
            <EventCalendar />
          </div>
        </section>

        {/* Donation Tiers Section */}
        <section
          id="tiers"
          className="py-32 px-6 relative overflow-hidden bg-paper"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest"
              >
                <Heart size={14} />
                <span>Monthly Support</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance">
                Choose Your <span className="text-apple italic font-normal">Impact</span>.
              </h2>
              <p className="text-xl text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Join our monthly giving program to provide consistent, reliable support for Michigan teachers and their students.
              </p>
            </div>
            <DonationTiers />
          </div>
        </section>

        {/* Donor Wall Section */}
        <section
          id="donors"
          className="py-32 px-6 bg-chalkboard text-white relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-pencil/30"
              >
                <Heart size={14} />
                <span>Wall of Fame</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance text-white">
                Our <span className="text-pencil italic font-normal">Supporters</span>.
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
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
          className="py-32 px-6 bg-paper relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-apple/20"
              >
                <Sparkles size={14} />
                <span>Impact Stories</span>
              </motion.div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight text-balance">
                Voices from the <span className="text-apple italic font-normal">Classroom</span>.
              </h2>
              <p className="text-xl text-chalkboard/60 max-w-2xl mx-auto font-light leading-relaxed">
                Real stories from educators whose classrooms were changed by your generosity. Every story is a testament to the power of community.
              </p>
            </div>
            <TeacherStories />
          </div>
        </section>

        {/* Newsletter Section */}
        <Newsletter />

        {/* Contact Section */}
        <section id="contact" className="py-24 px-6 bg-paper">
          <div className="max-w-7xl mx-auto">
            <ContactForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="bg-chalkboard text-white py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-20 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-apple rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3">
                  <BookOpen size={28} />
                </div>
                <span className="font-serif text-3xl font-bold tracking-tight">Funding Michigan Teachers</span>
              </div>
              <p className="text-white/50 max-w-md mb-10 text-lg font-light leading-relaxed">
                A student-led 501(c)(3) nonprofit organization dedicated to empowering Michigan's educators and transforming classrooms through community support.
              </p>
              <div className="flex gap-6">
                {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                  <a key={social} href="#" className="text-white/30 hover:text-apple transition-colors text-sm font-bold uppercase tracking-widest">
                    {social}
                  </a>
                ))}
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
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <button
                onClick={() => setShowAdmin(true)}
                className="hover:text-white/60 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-apple/5 rounded-full blur-[150px] -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ruler/5 rounded-full blur-[100px] -z-0 -translate-x-1/2 translate-y-1/2" />
      </footer>

      {/* FAQ Assistant */}
      <FAQAssistant />

      {/* Admin Panel */}
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}
