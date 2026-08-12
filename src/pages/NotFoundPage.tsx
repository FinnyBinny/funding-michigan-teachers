import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const WAYS_OUT = [
  { label: 'Home', path: '/', hint: 'Start from the beginning' },
  { label: 'Donate', path: '/donate', hint: 'Support a Michigan teacher' },
  { label: 'Donate Returnables', path: '/returnables', hint: 'Turn cans into classroom support' },
  { label: 'For Schools', path: '/for-schools', hint: 'Bring FMT to your building' },
];

/**
 * 404. The Worker serves this shell with a real 404 status (worker/index.ts),
 * so search engines and link checkers are told the truth — previously every
 * mistyped URL rendered the homepage at status 200.
 */
export default function NotFoundPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Page not found · Funding Michigan Teachers';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <div className="pointer-events-none absolute top-0 left-0 w-[600px] h-[600px] bg-apple/[0.06] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-full max-w-lg text-center"
        >
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-apple/10 text-apple flex items-center justify-center">
            <Compass size={24} strokeWidth={1.5} />
          </div>

          <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-4">
            Error 404
          </p>
          <h1 className="font-serif font-bold text-[clamp(2rem,7vw,3rem)] leading-[1.05] tracking-[-0.02em] mb-4">
            This page went <span className="text-apple italic font-normal">missing</span>.
          </h1>
          <p className="font-hand text-xl text-chalkboard/45 -rotate-1 mb-8">
            even our best students misplace things
          </p>
          <p className="text-chalkboard/60 font-light leading-relaxed mb-9">
            The link may be out of date, or the address might have a typo. Here's where
            most people are headed:
          </p>

          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {WAYS_OUT.map((way, i) => (
              <motion.button
                key={way.path}
                onClick={() => navigate(way.path)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE }}
                className="group bg-white ring-1 ring-chalkboard/8 hover:ring-apple/30 rounded-[1.25rem] px-5 py-4 min-h-[64px] flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-chalkboard leading-snug">{way.label}</span>
                  <span className="block text-xs text-chalkboard/50 font-light leading-snug">{way.hint}</span>
                </span>
                <span className="w-7 h-7 rounded-full bg-chalkboard/5 group-hover:bg-apple group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight size={13} />
                </span>
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-chalkboard/50 hover:text-apple transition-colors min-h-[44px]"
          >
            <ArrowLeft size={14} />
            Back to Funding Michigan Teachers
          </button>
        </motion.div>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
