/**
 * Shared footer for sub-pages (/donate, /for-schools, /sponsors, /returnables,
 * /about, /privacy, 404). The homepage keeps its own full-width footer.
 */
function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Two tiers, because one row of ten links is a wall.
 *
 * NAV is where a visitor is trying to go. UTILITY is the smaller stuff —
 * the ask aimed at schools, the bottle-return page whose name means nothing
 * to a stranger, the policy — and it sits down on the legal line where that
 * kind of link belongs. Nothing was removed; Home went because the logo
 * beside it already goes home.
 */
const NAV = [
  { label: 'About', path: '/about' },
  { label: 'Partner Schools', path: '/schools' },
  { label: 'For Teachers', path: '/for-teachers' },
  { label: 'For Businesses', path: '/sponsors' },
  { label: 'Donate', path: '/donate' },
  { label: 'Shop', path: '/shop' },
];

const UTILITY = [
  { label: 'Bring FMT to your school', path: '/for-schools' },
  { label: 'Returnables', path: '/returnables' },
  { label: 'Privacy', path: '/privacy' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-chalkboard text-white px-6 py-12 relative overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/8">
          {/* Brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-xl -rotate-3 group-hover:rotate-0 transition-transform shrink-0">
              <picture>
                <source srcSet="/images/fmt-logo-96.avif" type="image/avif" />
                <img src="/images/fmt-logo-96.png" alt="Funding Michigan Teachers" width={96} height={96} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </picture>
            </div>
            <div>
              <p className="font-serif text-lg font-bold tracking-tight leading-none">Funding Michigan Teachers</p>
              <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-white/60 mt-1">Student-Led 501(c)(3) Nonprofit · Okemos, Michigan</p>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a
              href="mailto:hello@fundingmichiganteachers.org"
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/60 hover:text-white transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/60 text-xs">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span>&copy; {new Date().getFullYear()} Funding Michigan Teachers</span>
            <span className="font-mono uppercase tracking-widest text-[9px] px-3 py-1 bg-white/5 rounded-full">EIN: 93-4485967</span>
            {UTILITY.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="https://www.instagram.com/fundingmichiganteachers" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">Instagram</a>
            <a href="https://www.facebook.com/fundingmichiganteachers" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">Facebook</a>
            <a href="https://www.linkedin.com/company/funding-michigan-teachers" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-apple/5 rounded-full blur-[130px] translate-x-1/2 -translate-y-1/2" />
    </footer>
  );
}
