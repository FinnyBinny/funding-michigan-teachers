import { useState, useEffect, useRef } from 'react';
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

/**
 * Audience-based navigation: a visitor picks the row that describes them
 * rather than guessing which action applies. Donate stays a standing button
 * so it never competes with the four audience pages.
 *
 * Returnables is deliberately absent — the word means nothing to a stranger.
 * It lives inside both footers and on the donate page instead.
 *
 * "Partner Schools" (/schools) replaced "For Schools" (/for-schools) here.
 * The two labels sitting side by side asked every visitor to work out the
 * difference between a school we work in and a school we would like to work
 * in. Recruitment still has its page; it is reached from the footer and from
 * the bottom of /schools, where someone looking for it is already standing.
 *
 * Shop sits last on purpose. It was originally left out entirely to keep an
 * Ad Grants site from reading as commercial, but that buried it in the footer
 * where nobody found it. One store link after four mission links is not a
 * commercial site; an unfindable shop is just a shop nobody uses.
 */
const PAGES = [
  { label: 'About', path: '/about' },
  { label: 'For Teachers', path: '/for-teachers' },
  { label: 'Partner Schools', path: '/schools' },
  { label: 'For Businesses', path: '/sponsors' },
  { label: 'Shop', path: '/shop' },
];

/** Section anchors offered in the mobile menu on the homepage only. */
const HOME_ANCHORS = [
  { label: 'Mission', hash: '#mission' },
  { label: 'Schools', hash: '#schools' },
  { label: 'Impact', hash: '#impact' },
  { label: 'Projects', hash: '#projects' },
  { label: 'Programs', hash: '#programs' },
  { label: 'Events', hash: '#events' },
  { label: 'Stories', hash: '#stories' },
];

/**
 * `onDark` is for pages that open with a full-bleed dark band under the
 * header — the partner school pages. The header is transparent until you
 * scroll 50px, so its normal chalkboard text sits dark-on-navy and is
 * effectively invisible. On those pages it starts white and hands over to the
 * usual dark-on-white treatment once the background turns opaque.
 */
export default function SiteHeader({ isHome = false, onDark = false }: { isHome?: boolean; onDark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const current = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/';

  // While the phone menu is open it is the page: Escape closes it, the page
  // behind is inert (no Tab stops hidden under the panel) and does not
  // scroll. Closing with Escape hands focus back to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    const behind = [...document.querySelectorAll<HTMLElement>('main, footer')];
    behind.forEach((el) => el.setAttribute('inert', ''));
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      behind.forEach((el) => el.removeAttribute('inert'));
      html.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // True only while the header is still transparent over a dark band.
  const overDark = onDark && !scrolled;

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  /**
   * Navigation items are real links, so they can be opened in a new tab and a
   * screen reader announces them as links, with the click handled in-app.
   * A modified click (new tab, new window) is left to the browser.
   */
  const linkProps = (path: string) => ({
    href: path,
    'aria-current': current === path ? ('page' as const) : undefined,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      go(path);
    },
  });

  /** Skips to the page's <main>, whichever page this is. */
  const skipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector('main');
    if (!main) return;
    e.preventDefault();
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.scrollIntoView();
  };

  return (
    <header>
      <a href="#main" onClick={skipToContent} className="skip-link">Skip to content</a>
      <nav
        aria-label="Main"
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,box-shadow] duration-300 px-6 py-4',
          scrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] py-3' : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex justify-between items-center">
          <a {...linkProps('/')} className="flex items-center gap-3 group cursor-pointer min-w-0 text-left" aria-label="Funding Michigan Teachers — home">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg transform -rotate-3 transition-transform group-hover:rotate-0 shrink-0">
              <picture>
                <source srcSet="/images/fmt-logo-96.avif 96w, /images/fmt-logo-192.avif 192w" sizes="48px" type="image/avif" />
                <img src="/images/fmt-logo-96.png" srcSet="/images/fmt-logo-96.png 96w, /images/fmt-logo-192.png 192w" sizes="48px" alt="" width={96} height={96} className="w-full h-full object-cover" decoding="async" />
              </picture>
            </div>
            <div className="flex flex-col min-w-0">
              <span className={cn('font-serif text-base sm:text-xl font-bold tracking-tight leading-none truncate', overDark && 'text-white')}>Funding Michigan Teachers</span>
              <span className={cn('text-[0.625rem] uppercase tracking-[0.2em] font-bold hidden sm:block', overDark ? 'text-white/70' : 'text-muted')}>Student-Led Nonprofit</span>
            </div>
          </a>

          {/* Desktop nav — real pages, every page */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-xs uppercase tracking-[0.15em]">
            {PAGES.map((item) => (
              <a
                key={item.path}
                {...linkProps(item.path)}
                className={cn(
                  'transition-colors relative group cursor-pointer uppercase tracking-[0.15em]',
                  overDark ? 'text-white/85 hover:text-white' : 'hover:text-apple',
                  current === item.path && (overDark ? 'text-white' : 'text-apple'),
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[2px] transition-all',
                    overDark ? 'bg-white' : 'bg-apple',
                    current === item.path ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </a>
            ))}
            <a
              {...linkProps('/donate')}
              className={cn(
                'px-8 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg font-bold cursor-pointer',
                overDark ? 'bg-white text-chalkboard hover:bg-white/90' : 'bg-chalkboard text-white hover:bg-apple',
              )}
            >
              Donate Now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={toggleRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn('lg:hidden p-2 rounded-xl transition-colors', overDark && !menuOpen ? 'text-white hover:bg-white/10' : 'hover:bg-chalkboard/5')}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="site-menu"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white pt-24 pb-8 px-6 shadow-2xl lg:hidden max-h-[100dvh] overflow-y-auto overscroll-contain"
          >
            <div className="flex flex-col gap-4">
              {[{ label: 'Home', path: '/' }, ...PAGES].map((item) => (
                <a
                  key={item.path}
                  {...linkProps(item.path)}
                  className={cn(
                    'text-left text-lg font-bold uppercase tracking-widest hover:text-apple transition-colors py-2 border-b border-chalkboard/10',
                    current === item.path && 'text-apple',
                  )}
                >
                  {item.label}
                </a>
              ))}

              {isHome && (
                <div className="mt-2">
                  <p className="text-[0.625rem] uppercase tracking-[0.25em] font-bold text-muted mb-2">On this page</p>
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

              <a
                {...linkProps('/donate')}
                className="mt-4 bg-apple text-white text-center px-8 py-4 rounded-2xl font-bold text-lg hover:bg-apple/90 transition-all cursor-pointer"
              >
                Donate Now
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
