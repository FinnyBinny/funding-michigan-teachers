import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * The one site-wide header.
 *
 * Before this existed every page rolled its own: the homepage nav had six
 * same-page anchors and zero links to other pages, and on a phone the /donate
 * header could only reach Home. Google's Ad Grants policy asks for "clear
 * navigation" — this is it: every page, reachable from every page, at every
 * width. Styling is lifted from the old homepage nav so nothing reads as a
 * redesign.
 */

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const PAGES = [
  { label: 'About', path: '/about' },
  { label: 'Donate', path: '/donate' },
  { label: 'For Schools', path: '/for-schools' },
  { label: 'Sponsors', path: '/sponsors' },
  { label: 'Returnables', path: '/returnables' },
];

/** Section anchors offered in the mobile menu on the homepage only. */
const HOME_ANCHORS = [
  { label: 'Mission', hash: '#mission' },
  { label: 'Impact', hash: '#impact' },
  { label: 'Projects', hash: '#projects' },
  { label: 'Events', hash: '#events' },
  { label: 'Stories', hash: '#stories' },
];

export default function SiteHeader({ isHome = false }: { isHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const current = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,box-shadow] duration-300 px-6 py-4',
          scrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] py-3' : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex justify-between items-center">
          <button onClick={() => go('/')} className="flex items-center gap-3 group cursor-pointer min-w-0 text-left" aria-label="Funding Michigan Teachers — home">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg transform -rotate-3 transition-transform group-hover:rotate-0 shrink-0">
              <picture>
                <source srcSet="/images/fmt-logo-96.avif" type="image/avif" />
                <img src="/images/fmt-logo-96.png" alt="" width={96} height={96} className="w-full h-full object-cover" decoding="async" />
              </picture>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base sm:text-xl font-bold tracking-tight leading-none truncate">Funding Michigan Teachers</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted hidden sm:block">Student-Led Nonprofit</span>
            </div>
          </button>

          {/* Desktop nav — real pages, every page */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-xs uppercase tracking-[0.15em]">
            {PAGES.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={cn(
                  'hover:text-apple transition-colors relative group cursor-pointer uppercase tracking-[0.15em]',
                  current === item.path && 'text-apple',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[2px] bg-apple transition-all',
                    current === item.path ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </button>
            ))}
            <button
              onClick={() => go('/donate')}
              className="bg-chalkboard text-white px-8 py-2.5 rounded-full hover:bg-apple transition-all hover:scale-105 active:scale-95 shadow-lg font-bold cursor-pointer"
            >
              Donate Now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-chalkboard/5 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl pt-24 pb-8 px-6 shadow-2xl lg:hidden max-h-screen overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              {[{ label: 'Home', path: '/' }, ...PAGES].map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={cn(
                    'text-left text-lg font-bold uppercase tracking-widest hover:text-apple transition-colors py-2 border-b border-chalkboard/5',
                    current === item.path && 'text-apple',
                  )}
                >
                  {item.label}
                </button>
              ))}

              {isHome && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted mb-2">On this page</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {HOME_ANCHORS.map((a) => (
                      <a
                        key={a.hash}
                        href={a.hash}
                        onClick={() => setMenuOpen(false)}
                        className="text-sm font-bold uppercase tracking-widest text-chalkboard/70 hover:text-apple transition-colors"
                      >
                        {a.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => go('/donate')}
                className="mt-4 bg-apple text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-apple/90 transition-all cursor-pointer"
              >
                Donate Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
