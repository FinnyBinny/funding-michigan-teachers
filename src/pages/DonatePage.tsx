import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Heart, Shield, CheckCircle2, Loader2,
  ExternalLink, Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const ZEFFY_BASE = 'https://www.zeffy.com/en-US/embed/donation-form/supporting-the-teachers-who-support-us';
const ZEFFY_FALLBACK = 'https://www.zeffy.com/en-US/donation-form/supporting-the-teachers-who-support-us';

const QUICK_TILES = [
  { amount: 10,  freq: 'monthly' as const, label: 'Bell Ringer',     impact: 'A box of classroom supplies — every month' },
  { amount: 25,  freq: 'once'    as const, label: 'One-time Boost',  impact: 'A staff-meeting treat for a whole department' },
  { amount: 50,  freq: 'monthly' as const, label: 'Honor Roll',      impact: 'Feeds the staff of a small Okemos school monthly' },
  { amount: 100, freq: 'monthly' as const, label: 'Department Lead', impact: 'Funds one classroom grant every quarter' },
  { amount: 250, freq: 'monthly' as const, label: 'Hall of Fame',    impact: 'Powers an entire school\'s appreciation program' },
  { amount: 0,   freq: 'monthly' as const, label: 'Custom Amount',   impact: 'Pick the number that\'s right for you' },
];

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function DonatePage() {
  const [amount, setAmount] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'monthly' | 'once'>('monthly');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const embedUrl =
    amount && amount > 0
      ? `${ZEFFY_BASE}?amount=${amount}&frequency=${frequency}`
      : ZEFFY_BASE;

  const fallbackUrl =
    amount && amount > 0
      ? `${ZEFFY_FALLBACK}?amount=${amount}&frequency=${frequency}`
      : ZEFFY_FALLBACK;

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative">

      {/* Floating glass nav island */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/85 backdrop-blur-2xl ring-1 ring-chalkboard/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-1 pl-2 pr-2 py-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-chalkboard/5"
            style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
          >
            <span className="w-7 h-7 rounded-full bg-chalkboard/5 flex items-center justify-center group-hover:bg-chalkboard/10">
              <ArrowLeft size={13} strokeWidth={1.5} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hidden sm:inline">Home</span>
          </button>
          <div className="w-px h-6 bg-chalkboard/10 mx-1" />
          <div className="hidden md:flex items-center gap-0.5">
            <button onClick={() => navigate('/sponsors')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5">Sponsor</button>
            <button onClick={() => navigate('/for-schools')} className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hover:text-chalkboard px-3 py-2 rounded-full hover:bg-chalkboard/5">For Schools</button>
          </div>
        </div>
      </nav>

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-apple/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pencil/10 rounded-full blur-[160px]" />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-white/85 ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold mb-7 uppercase tracking-[0.24em] text-chalkboard/70 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <span className="w-1.5 h-1.5 rounded-full bg-apple animate-pulse" />
                100% of your gift goes to teachers · Zero processing fees
              </div>
              <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.025em] mb-7 text-[clamp(2.5rem,5vw,4.5rem)]">
                Make this <span className="text-apple italic font-normal">real</span> for a Michigan teacher.
              </h1>
              <p className="text-lg text-chalkboard/65 max-w-xl leading-relaxed font-light">
                Pick a tile or enter your own amount. We process gifts through Zeffy — the only donation platform that takes a 0% cut from nonprofits. Every dollar you give lands in a classroom or on a teacher's table.
              </p>
            </motion.div>

            {/* Right: trust signals card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="lg:col-span-5"
            >
              <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                <div className="bg-white rounded-[calc(2rem-0.5rem)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-5">Why donate here</p>
                  <ul className="space-y-3.5">
                    {[
                      { i: Shield, t: '501(c)(3) tax-deductible', s: 'EIN 93-4485967 — receipt emailed instantly' },
                      { i: Sparkles, t: '0% platform fees', s: 'Zeffy charges nonprofits nothing. Stripe / GoFundMe take 3–5%' },
                      { i: Heart, t: 'Direct to teachers', s: 'Funds classrooms, meals, and appreciation events' },
                    ].map((row) => (
                      <li key={row.t} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-apple/10 text-apple flex items-center justify-center shrink-0 mt-0.5">
                          <row.i size={14} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-chalkboard">{row.t}</p>
                          <p className="text-xs text-chalkboard/55 mt-0.5 font-light leading-snug">{row.s}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Frequency toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="flex justify-center mb-10"
          >
            <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/10 rounded-full p-1 flex items-center gap-1">
              {(['monthly', 'once'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    'relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em]',
                    'transition-colors',
                  )}
                  style={{ transition: 'color 500ms cubic-bezier(0.32,0.72,0,1)' }}
                >
                  {frequency === f && (
                    <motion.span
                      layoutId="freq-pill"
                      className="absolute inset-0 bg-chalkboard rounded-full"
                      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    />
                  )}
                  <span className={cn('relative z-10', frequency === f ? 'text-white' : 'text-chalkboard/60')}>
                    {f === 'monthly' ? 'Monthly' : 'One-time'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick-amount tiles — asymmetric bento */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {QUICK_TILES.map((tile, i) => {
              const selected = amount === tile.amount && tile.amount > 0;
              const isCustom = tile.amount === 0;
              return (
                <motion.button
                  key={tile.label}
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.4 + i * 0.05, ease: EASE }}
                  onClick={() => {
                    if (isCustom) {
                      const v = prompt('Enter your gift amount in USD:', '15');
                      const n = v ? parseInt(v, 10) : NaN;
                      if (!isNaN(n) && n > 0) setAmount(n);
                    } else {
                      setAmount(tile.amount);
                      setFrequency(tile.freq);
                    }
                  }}
                  className={cn(
                    'group text-left',
                    selected ? '' : '',
                  )}
                  style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
                >
                  {/* Outer bezel */}
                  <div className={cn(
                    'h-full rounded-[1.75rem] p-1.5 ring-1 transition-all',
                    selected ? 'bg-apple/10 ring-apple/40' : 'bg-chalkboard/[0.03] ring-chalkboard/8 group-hover:ring-chalkboard/20',
                  )}
                  style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}>
                    {/* Inner core */}
                    <div className={cn(
                      'h-full rounded-[calc(1.75rem-0.375rem)] p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] flex flex-col',
                      selected ? 'bg-white' : 'bg-white group-hover:bg-paper/50',
                    )}>
                      <div className="flex items-start justify-between mb-4">
                        <span className={cn(
                          'text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full',
                          selected ? 'bg-apple text-white' : 'bg-chalkboard/5 text-chalkboard/50',
                        )}>
                          {tile.freq === 'monthly' && !isCustom ? '/ Month' : tile.freq === 'once' ? 'One-time' : 'You pick'}
                        </span>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                            className="w-6 h-6 rounded-full bg-apple flex items-center justify-center"
                          >
                            <CheckCircle2 size={14} strokeWidth={1.8} className="text-white" />
                          </motion.div>
                        )}
                      </div>

                      <p className="font-serif font-bold text-[clamp(1.75rem,4vw,2.75rem)] leading-none tracking-[-0.02em] text-chalkboard mb-2">
                        {isCustom ? <span className="text-chalkboard/40 italic font-normal text-2xl">Custom</span> : `$${tile.amount}`}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-chalkboard/50 mb-3">{tile.label}</p>
                      <p className="text-xs text-chalkboard/55 leading-snug font-light mt-auto">{tile.impact}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Embedded Zeffy form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative"
          >
            <div className="bg-chalkboard/[0.04] ring-1 ring-chalkboard/10 rounded-[2.5rem] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="bg-white rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                {/* Embed header */}
                <div className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-chalkboard/5 bg-paper/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-apple flex items-center justify-center shadow-[0_8px_20px_rgba(192,57,43,0.25)]">
                      <Heart size={16} strokeWidth={1.5} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-chalkboard">
                        {amount ? `Donating $${amount}${frequency === 'monthly' ? ' / month' : ''}` : 'Secure donation'}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/40 mt-0.5">Powered by Zeffy · 0% fees</p>
                    </div>
                  </div>
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-chalkboard/50 hover:text-chalkboard px-3 py-2 rounded-lg hover:bg-chalkboard/5"
                  >
                    <ExternalLink size={12} strokeWidth={1.5} />
                    Open in new tab
                  </a>
                </div>

                {/* Iframe */}
                <div className="relative bg-paper/60" style={{ minHeight: '600px' }}>
                  <AnimatePresence>
                    {!loaded && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
                      >
                        <Loader2 className="animate-spin text-apple" size={32} strokeWidth={1.5} />
                        <p className="text-sm text-chalkboard/50">Loading secure donation form…</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <iframe
                    src={embedUrl}
                    title="Donation form"
                    allow="payment"
                    className="w-full border-0 block"
                    style={{ height: '700px' }}
                    onLoad={() => setLoaded(true)}
                  />
                </div>

                {/* Footer */}
                <div className="px-6 md:px-10 py-4 border-t border-chalkboard/5 bg-paper/40 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] font-bold text-chalkboard/40">
                  <span className="flex items-center gap-2">
                    <Shield size={11} strokeWidth={1.5} />
                    Tax-deductible · EIN 93-4485967
                  </span>
                  <span>Secure · PCI compliant</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Closing call */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-16 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-chalkboard/30 mb-4">Not ready to give today?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:hello@fundingmichiganteachers.org?subject=Corporate%20Sponsorship%20Inquiry"
                className="group flex items-center gap-2 bg-white ring-1 ring-chalkboard/15 hover:ring-chalkboard/30 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-chalkboard/70 hover:text-chalkboard"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Become a Corporate Sponsor
                <span className="w-7 h-7 rounded-full bg-chalkboard/5 group-hover:bg-chalkboard group-hover:text-white flex items-center justify-center group-hover:translate-x-0.5">
                  <ArrowRight size={11} strokeWidth={1.5} />
                </span>
              </a>
              <button
                onClick={() => navigate('/for-schools')}
                className="group flex items-center gap-2 bg-white ring-1 ring-chalkboard/15 hover:ring-chalkboard/30 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-chalkboard/70 hover:text-chalkboard"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                Bring FMT to Your School
                <span className="w-7 h-7 rounded-full bg-chalkboard/5 group-hover:bg-chalkboard group-hover:text-white flex items-center justify-center group-hover:translate-x-0.5">
                  <ArrowRight size={11} strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-chalkboard text-white py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-white/30 text-xs">
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Funding Michigan Teachers</span>
            <span className="font-mono uppercase tracking-widest text-[9px] px-3 py-1 bg-white/5 rounded-full">EIN: 93-4485967</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="hover:text-white">Main Site</button>
            <button onClick={() => navigate('/for-schools')} className="hover:text-white">For Schools</button>
            <a href="mailto:hello@fundingmichiganteachers.org" className="hover:text-white">hello@fundingmichiganteachers.org</a>
          </div>
        </div>
      </footer>

      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
