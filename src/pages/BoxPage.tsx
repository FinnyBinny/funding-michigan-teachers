import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, Loader2, Mail, RotateCcw } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import { supabase } from '../lib/supabase';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { track } from '../lib/analytics';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { boxCodeFromPath } from '../../shared/routes';

/**
 * A returnables collection box's own page: what opens when a teacher taps
 * the box's NFC tag or scans its QR code (/box/<code>).
 *
 * One job: "this box is full, come get it." The teacher confirms with a
 * button (a tag can be brushed by accident, and link previews open pages on
 * their own), then the box turns red in the admin dashboard's Boxes tab and
 * an email goes out (see FORMBOLD.boxPickup for where it goes).
 *
 * Everything goes through three database functions that work only for the
 * code in the link (SUPABASE_BOXES.sql); the page can't see any other box.
 * A box nobody has set up yet asks for its school and room on the first tap.
 */

const EMAIL = 'hello@fundingmichiganteachers.org';
const SCHOOLS = ['Okemos High School', 'East Lansing High School', 'Haslett High School'] as const;
const OTHER = 'Another school';

interface Box {
  box_number: number;
  school: string | null;
  room: string | null;
  teacher: string | null;
  status: 'ok' | 'full';
  requested_at: string | null;
  pickups: number;
}

type View =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'error' }
  | { kind: 'setup'; box: Box }
  | { kind: 'ready'; box: Box }
  | { kind: 'requested'; box: Box; already: boolean };

// The drawn cans and bottles from the returnables page, at one shared scale.
const CANS = [
  { file: 'can-red', w: 145, h: 202 },
  { file: 'bottle-clear', w: 148, h: 392 },
  { file: 'can-mini-lime', w: 126, h: 205 },
  { file: 'can-tall-orange', w: 153, h: 318 },
  { file: 'can-blue', w: 148, h: 211 },
  { file: 'can-slim-dark', w: 122, h: 259 },
] as const;

function Can({ file, w, h, scale }: { file: string; w: number; h: number; scale: number }) {
  return (
    <picture className="block">
      <source type="image/avif" srcSet={`/images/returnables/${file}.avif`} />
      <img src={`/images/returnables/${file}.webp`} alt="" width={w} height={h} style={{ height: h * scale, width: 'auto' }} className="block drop-shadow-[0_6px_6px_rgba(45,28,12,0.2)]" />
    </picture>
  );
}

/** A kraft-paper collection box, drawn in the site's ink-and-paper style. */
function BoxArt({ full, shake }: { full: boolean; shake: number }) {
  return (
    <motion.svg
      key={shake}
      viewBox="0 0 240 150"
      className="w-[min(78vw,320px)] h-auto"
      aria-hidden="true"
      initial={shake ? { rotate: 0 } : false}
      animate={shake ? { rotate: [0, -3, 3, -2, 2, 0], y: [0, 4, 0] } : undefined}
      transition={{ duration: 0.6 }}
    >
      {/* back flap */}
      <path d="M38 42 L60 14 L180 14 L202 42 Z" fill="#c99a5b" stroke="#2b1d12" strokeWidth="3" strokeLinejoin="round" />
      {/* body */}
      <path d="M30 42 L210 42 L198 140 L42 140 Z" fill="#d9ac6b" stroke="#2b1d12" strokeWidth="3.5" strokeLinejoin="round" />
      {/* front flaps */}
      <path d="M30 42 L12 64 L44 70 Z" fill="#e6bd80" stroke="#2b1d12" strokeWidth="3" strokeLinejoin="round" />
      <path d="M210 42 L228 64 L196 70 Z" fill="#e6bd80" stroke="#2b1d12" strokeWidth="3" strokeLinejoin="round" />
      {/* label */}
      <rect x="72" y="70" width="96" height="44" rx="6" fill="#fbf7ef" stroke="#2b1d12" strokeWidth="2.5" />
      <text x="120" y="90" textAnchor="middle" fontFamily="Architects Daughter, cursive" fontSize="15" fill="#c0392b">{full ? 'FULL!' : 'MI 10¢'}</text>
      <text x="120" y="106" textAnchor="middle" fontFamily="Architects Daughter, cursive" fontSize="11" fill="#2b1d12">{full ? 'pick me up!' : 'cans + bottles'}</text>
    </motion.svg>
  );
}

/** Little dimes and paper bits that burst out when a pickup goes in. */
function Confetti({ run }: { run: number }) {
  const reduce = useReducedMotion();
  if (!run || reduce) return null;
  const bits = Array.from({ length: 26 }, (_, i) => i);
  const colors = ['#c0392b', '#2a9d8f', '#e9a91a', '#1a479c', '#93b51c', '#b6bdc6'];
  return (
    <div key={run} className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {bits.map((i) => {
        const angle = (i / bits.length) * Math.PI * 2;
        const dist = 110 + (i % 5) * 22;
        const dime = i % 4 === 0;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block"
            style={{
              width: dime ? 16 : 9, height: dime ? 16 : 14, borderRadius: dime ? 999 : 3,
              background: dime ? 'radial-gradient(circle at 35% 35%, #f1f3f5, #9aa1a9)' : colors[i % colors.length],
              border: dime ? '1.5px solid #2b1d12' : undefined,
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.7 + 60, opacity: 0, rotate: 360 + i * 40, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.2, 0.8, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

function when(iso: string | null): string {
  if (!iso) return 'recently';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// "214" reads as Room 214; "Main office" stays as typed.
const where = (b: Box) => (!b.room ? `Box #${b.box_number}` : /^\d/.test(b.room) ? `Room ${b.room}` : b.room);

export default function BoxPage() {
  const code = boxCodeFromPath(window.location.pathname);
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);
  const reduce = useReducedMotion();

  const load = async () => {
    if (!code || !supabase) { setView({ kind: code ? 'error' : 'missing' }); return; }
    setView({ kind: 'loading' });
    const { data, error } = await supabase.rpc('box_lookup', { p_code: code });
    if (error) { setView({ kind: 'error' }); return; }
    if (!data) { setView({ kind: 'missing' }); return; }
    const box = data as Box;
    if (!box.school) setView({ kind: 'setup', box });
    else if (box.status === 'full') setView({ kind: 'requested', box, already: true });
    else setView({ kind: 'ready', box });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath(window.location.pathname));
    void load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const request = async () => {
    if (!code || !supabase) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('box_request_pickup', { p_code: code });
    setBusy(false);
    if (error || !data) { setView({ kind: 'error' }); return; }
    const { already, box } = data as { already: boolean; box: Box };
    if (!already) {
      setBurst((n) => n + 1);
      track('box_pickup_requested', { box: box.box_number, school: box.school ?? '' });
      // The email. Not awaited: the box is already red in the dashboard,
      // which is the record that counts.
      void submitToFormBold(FORMBOLD.boxPickup, {
        Form: 'Returnables box: pickup requested',
        summary: `Box #${box.box_number} is full: ${where(box)}, ${box.school}`,
        box: `#${box.box_number}`,
        school: box.school,
        room: box.room,
        teacher: box.teacher ?? '',
        requested: new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' }),
        dashboard: 'https://www.fundingmichiganteachers.org/access',
      });
    }
    setView({ kind: 'requested', box, already });
  };

  const setUp = async (school: string, room: string, teacher: string) => {
    if (!code || !supabase) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('box_claim', { p_code: code, p_school: school, p_room: room, p_teacher: teacher });
    setBusy(false);
    if (error || !data) { setView({ kind: 'error' }); return; }
    const box = data as Box;
    track('box_set_up', { box: box.box_number, school: box.school ?? '' });
    setView(box.school ? { kind: 'ready', box } : { kind: 'setup', box });
  };

  const box = 'box' in view ? view.box : null;
  const full = view.kind === 'requested';

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />
      <div className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] bg-apple/[0.07] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[460px] h-[460px] bg-[var(--color-campaign-teal)]/[0.09] rounded-full blur-[150px]" />

      <main id="main" className="relative z-10 flex-1 px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
        <div className="max-w-xl mx-auto text-center">
          {box && (
            <p className="inline-flex items-center gap-2 bg-white/85 ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[0.625rem] font-bold mb-6 uppercase tracking-[0.24em] text-chalkboard/70">
              <span className={`w-2 h-2 rounded-full ${full ? 'bg-apple' : 'bg-[var(--color-campaign-teal)]'}`} />
              Box #{box.box_number}{box.school ? ` · ${box.school}` : ''}
            </p>
          )}

          {/* The stage: cans hovering over the box, dropping in on request */}
          {(view.kind === 'ready' || view.kind === 'requested') && (
            <div className="relative flex flex-col items-center mb-8">
              <div className="flex items-end justify-center gap-2 h-[120px] mb-[-34px] relative z-0">
                {CANS.map((c, i) => (
                  <motion.div
                    key={c.file + (full ? '-in' : '-up')}
                    initial={full && !reduce ? { y: -40, opacity: 1 } : { y: 0 }}
                    animate={
                      full
                        ? { y: 30, opacity: 1, rotate: (i - 2.5) * 7 }
                        : reduce ? { y: 0 } : { y: [0, -8, 0] }
                    }
                    transition={
                      full
                        ? { type: 'spring', stiffness: 260, damping: 14, delay: i * 0.08 }
                        : { duration: 2.2 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
                    }
                  >
                    <Can {...c} scale={0.26} />
                  </motion.div>
                ))}
              </div>
              <div className="relative z-10">
                <BoxArt full={full} shake={burst} />
                <Confetti run={burst} />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={view.kind}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {view.kind === 'loading' && (
                <p className="py-24 text-chalkboard/70 inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Finding your box…
                </p>
              )}

              {view.kind === 'ready' && (
                <>
                  <h1 className="font-serif font-bold text-[clamp(2.25rem,8vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-3">
                    Is {where(view.box)}'s box <span className="text-apple italic font-normal">stuffed?</span>
                  </h1>
                  <p className="font-hand text-xl text-chalkboard/75 -rotate-1 mb-2">every can is a dime for teachers</p>
                  <p className="text-chalkboard/70 font-light leading-relaxed mb-8">
                    Tap the button and our student team gets the message to come empty it.
                  </p>
                  <button
                    onClick={request}
                    disabled={busy}
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-apple text-white pl-8 sm:pl-10 pr-2.5 py-3 rounded-full font-bold text-lg uppercase tracking-[0.12em] shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.97] min-h-[64px] disabled:opacity-70"
                  >
                    {busy ? 'Sending…' : 'Request a pickup'}
                    <span className="w-11 h-11 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center">
                      {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                    </span>
                  </button>
                  {view.box.pickups > 0 && (
                    <p className="mt-6 text-sm text-chalkboard/70">
                      We've emptied this box <strong className="text-chalkboard">{view.box.pickups}</strong> time{view.box.pickups === 1 ? '' : 's'} so far. Keep 'em coming.
                    </p>
                  )}
                </>
              )}

              {view.kind === 'requested' && (
                <div role="status">
                  <h1 className="font-serif font-bold text-[clamp(2.25rem,8vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-3">
                    {view.already ? 'Already on our list!' : <>Pickup <span className="text-apple italic font-normal">requested!</span></>}
                  </h1>
                  <p className="font-hand text-xl text-chalkboard/75 -rotate-1 mb-4">
                    {view.already ? 'no need to tap again' : 'thank you, cans: you did great'}
                  </p>
                  <p className="text-chalkboard/70 font-light leading-relaxed">
                    {view.already
                      ? <>Someone asked for a pickup {when(view.box.requested_at)}. Our student team has it and will come empty the box.</>
                      : <>Our student team has the message and will come empty {where(view.box)}'s box. It's this box's pickup #{view.box.pickups + 1}.</>}
                  </p>
                  <p className="mt-6 text-sm text-chalkboard/70">
                    Every Michigan 10¢ deposit goes to classroom supplies, staff meals and teacher appreciation.
                  </p>
                </div>
              )}

              {view.kind === 'setup' && <SetUpForm box={view.box} busy={busy} onSubmit={setUp} />}

              {view.kind === 'missing' && (
                <Problem title="We can't find this box" body="The link on this tag doesn't match a box of ours. Let us know and we'll sort it out." />
              )}

              {view.kind === 'error' && (
                <Problem title="We couldn't reach our system" body="Check your connection and try again. If it keeps happening, email us and we'll come get the box." retry={load} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SetUpForm({ box, busy, onSubmit }: { box: Box; busy: boolean; onSubmit: (school: string, room: string, teacher: string) => void }) {
  const [school, setSchool] = useState('');
  const [other, setOther] = useState('');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const field = 'w-full bg-paper border border-chalkboard/15 rounded-xl px-4 py-3 text-base focus:ring-4 focus:ring-apple/10 focus:border-apple/40 outline-none';
  const label = 'block text-left text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 ml-1';
  return (
    <>
      <div className="flex justify-center mb-6"><BoxArt full={false} shake={0} /></div>
      <h1 className="font-serif font-bold text-[clamp(2rem,7vw,3rem)] leading-[1.05] tracking-[-0.02em] mb-3">
        A brand-new box! <span className="text-apple italic font-normal">Where does it live?</span>
      </h1>
      <p className="text-chalkboard/70 font-light mb-7">One-time setup for box #{box.box_number}. After this, a tap is all it takes.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(school === OTHER ? other : school, room, teacher); }}
        className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-8 space-y-5 text-left"
      >
        <div>
          <label htmlFor="box-school" className={label}>School</label>
          <select id="box-school" required value={school} onChange={(e) => setSchool(e.target.value)} className={field}>
            <option value="" disabled>Pick your school</option>
            {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value={OTHER}>{OTHER}</option>
          </select>
        </div>
        {school === OTHER && (
          <div>
            <label htmlFor="box-school-other" className={label}>Which school?</label>
            <input id="box-school-other" required maxLength={80} value={other} onChange={(e) => setOther(e.target.value)} className={field} />
          </div>
        )}
        <div>
          <label htmlFor="box-room" className={label}>Room number (or where the box is)</label>
          <input id="box-room" required maxLength={40} value={room} onChange={(e) => setRoom(e.target.value)} className={field} placeholder="214, or Main office" />
        </div>
        <div>
          <label htmlFor="box-teacher" className={label}>Your name (optional)</label>
          <input id="box-teacher" maxLength={60} autoComplete="name" value={teacher} onChange={(e) => setTeacher(e.target.value)} className={field} />
        </div>
        <button type="submit" disabled={busy} className="w-full bg-apple text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60 min-h-[56px]">
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
          Set up my box
        </button>
        <p className="text-xs text-chalkboard/70 text-center">We use this only to know which box to empty.</p>
      </form>
    </>
  );
}

function Problem({ title, body, retry }: { title: string; body: string; retry?: () => void }) {
  return (
    <div className="py-10" role="alert">
      <div className="flex justify-center mb-6 opacity-80"><BoxArt full={false} shake={0} /></div>
      <h1 className="font-serif font-bold text-3xl sm:text-4xl mb-3">{title}</h1>
      <p className="text-chalkboard/70 font-light mb-7">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {retry && (
          <button onClick={retry} className="inline-flex items-center justify-center gap-2 bg-chalkboard text-white px-6 py-3 rounded-full font-bold min-h-[48px]">
            <RotateCcw size={16} aria-hidden="true" /> Try again
          </button>
        )}
        <a href={`mailto:${EMAIL}?subject=Returnables%20box`} className="inline-flex items-center justify-center gap-2 bg-white ring-1 ring-chalkboard/15 px-6 py-3 rounded-full font-bold min-h-[48px]">
          <Mail size={16} aria-hidden="true" /> {EMAIL}
        </a>
      </div>
    </div>
  );
}
