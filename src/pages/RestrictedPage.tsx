import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Mail } from 'lucide-react';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const APPEAL_EMAIL = 'hello@fundingmichiganteachers.org';

/**
 * Shown when a visitor's network has been blocked (worker/index.ts redirects
 * here and serves this shell with a 403).
 *
 * Deliberately calm and factual — it accuses no one, names no rule, and never
 * echoes back the visitor's IP. A single address can cover an entire
 * household, school, or office, so the appeal path is the important part of
 * this page: someone caught by a shared connection needs a way to reach a
 * human. No site navigation or footer, since the rest of the site is closed to
 * them anyway and offering links would only lead to more redirects.
 */
export default function RestrictedPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Access restricted · Funding Michigan Teachers';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[520px] bg-chalkboard/[0.05] rounded-full blur-[140px] translate-x-1/3 -translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-7 sm:p-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-chalkboard/[0.06] text-chalkboard/70 flex items-center justify-center">
            <ShieldAlert size={24} strokeWidth={1.5} />
          </div>

          <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-3">
            Access restricted
          </p>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl leading-tight tracking-[-0.01em] mb-4">
            You can't reach this site right now.
          </h1>
          <p className="text-sm text-chalkboard/60 font-light leading-relaxed mb-7">
            Access to Funding Michigan Teachers has been restricted from this network.
          </p>

          <div className="bg-paper ring-1 ring-chalkboard/8 rounded-2xl px-5 py-5 text-left">
            <p className="text-sm font-bold text-chalkboard mb-1.5">Think this is a mistake?</p>
            <p className="text-xs text-chalkboard/55 font-light leading-relaxed mb-4">
              This can happen to a whole household, school, or office at once — if you
              believe you've been restricted in error, get in touch and we'll take a look.
            </p>
            <a
              href={`mailto:${APPEAL_EMAIL}?subject=${encodeURIComponent('Restricted access — request to review')}`}
              className="group inline-flex items-center gap-2.5 bg-chalkboard text-white pl-5 pr-2 py-2 rounded-full font-bold text-xs uppercase tracking-[0.16em] hover:bg-apple min-h-[44px] transition-colors"
            >
              <Mail size={13} strokeWidth={1.5} />
              Contact us
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/30 mt-6">
          Funding Michigan Teachers · Student-Led 501(c)(3)
        </p>
      </motion.div>

      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
