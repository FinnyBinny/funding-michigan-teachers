import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import AdminPanel from '../components/AdminPanel';
import { supabase } from '../lib/supabase';
import { setPageMeta } from '../lib/seo';

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Admin sign-in.
 *
 * This is real authentication via Supabase Auth (email + password user created
 * in the Supabase dashboard under Authentication → Users). It replaced a
 * hardcoded password that shipped inside the public JS bundle — anyone could
 * read it with View Source. The authenticated session is also what Row Level
 * Security now requires for every content write and for reading form
 * submissions, so the anon key in the bundle can't be used to vandalize the
 * site.
 */
export default function AccessPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageMeta({
      title: 'Admin · Funding Michigan Teachers',
      description: 'Internal dashboard.',
      path: '/access',
      noindex: true,
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pw,
    });
    setBusy(false);
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Wrong email or password. Try again.'
          : err.message,
      );
    }
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setPw('');
  };

  if (authed) {
    return (
      <div className="min-h-[100dvh] bg-paper">
        {/* Floating control bar */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 bg-white/85 backdrop-blur-xl border border-chalkboard/10 rounded-full pl-3 pr-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-chalkboard/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:text-chalkboard transition-all"
            style={{ transition: `all 600ms ${EASE}` }}
          >
            <span className="w-7 h-7 rounded-full bg-chalkboard/5 flex items-center justify-center group-hover:bg-chalkboard/10 transition-colors">
              <ArrowLeft size={13} />
            </span>
            Back to Site
          </button>
          <button
            onClick={signOut}
            className="bg-chalkboard text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] hover:bg-apple transition-colors shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          >
            Sign Out
          </button>
        </div>

        {/* Always-open admin panel */}
        <div className="pt-20">
          <AdminPanel isOpen={true} preAuthed={true} onClose={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-chalkboard text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient radial glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] bg-apple/10 rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-60 -right-40 w-[700px] h-[700px] bg-ruler/10 rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
           style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Outer bezel shell */}
        <div className="bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 rounded-[2.25rem] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          {/* Inner core */}
          <div className="bg-gradient-to-b from-chalkboard/95 to-[#0f1011] rounded-[calc(2.25rem-0.5rem)] p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-apple/15 ring-1 ring-apple/30 rounded-2xl flex items-center justify-center mb-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <ShieldCheck size={24} className="text-apple" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-white/40 mb-3">Restricted</p>
              <h1 className="text-3xl font-serif font-bold leading-tight text-center mb-2">Admin Access</h1>
              <p className="text-white/40 text-sm font-light text-center max-w-xs leading-relaxed mb-8">
                {supabase
                  ? 'Sign in to manage sponsors, partners, projects, stories, and site content.'
                  : 'The dashboard is offline: the database connection is not configured in this build.'}
              </p>
            </div>

            {!checking && supabase && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    id="admin-email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null); }}
                    className="w-full bg-white/5 ring-1 ring-white/10 focus:ring-apple/40 transition-all rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none placeholder:text-white/30 text-white"
                    placeholder="Email"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    id="admin-password"
                    name="password"
                    autoComplete="current-password"
                    value={pw}
                    onChange={e => { setPw(e.target.value); setError(null); }}
                    className={cn(
                      'w-full bg-white/5 ring-1 ring-white/10 focus:ring-apple/40 transition-all rounded-2xl pl-11 pr-12 py-3.5 text-sm font-medium outline-none placeholder:text-white/30 text-white',
                      error && 'ring-2 ring-apple/60'
                    )}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-apple text-xs font-bold tracking-wide pl-1"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="group relative w-full bg-white text-chalkboard rounded-full py-3.5 font-bold text-sm uppercase tracking-[0.18em] flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_8px_30px_rgba(255,255,255,0.15)] disabled:opacity-60"
                  style={{ transition: `transform 600ms ${EASE}, background-color 400ms ${EASE}` }}
                >
                  <span>{busy ? 'Signing in…' : 'Unlock Dashboard'}</span>
                  <span className="w-7 h-7 rounded-full bg-chalkboard/5 group-hover:bg-apple group-hover:text-white flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-all">
                    →
                  </span>
                </button>
              </form>
            )}

            <button
              onClick={() => navigate('/')}
              className="mt-6 mx-auto block text-[10px] uppercase tracking-[0.28em] font-bold text-white/30 hover:text-white/60 transition-colors"
            >
              ← Back to Public Site
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.28em] font-bold text-white/40 mt-8">
          Funding Michigan Teachers · Internal
        </p>
      </motion.div>
    </div>
  );
}
