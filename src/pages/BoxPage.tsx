import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, Loader2, Mail, RotateCcw } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import { boxRpc } from '../lib/boxApi';
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

/**
 * The box and its cans, drawn on one 320-wide grid so everything lines up
 * at any screen size.
 *
 * Depth comes from three stacked layers: the back of the box (back flap,
 * side flaps, dark inside), then the cans, then the front of the box. A can
 * that drops "in" slides down between the back and the front, so the front
 * wall hides its lower half exactly as a real box would.
 */
const GRID = 320;
const INK = '#2b1d12';

// The drawn cans and bottles from the returnables page. For each: where it
// waits in a tidy row above the box (x, all standing on one line), and where
// it comes to rest inside (inX, inBottom, a slight lean). `front` cans sit
// nearer the viewer and overlap the ones behind.
const CANS = [
  { file: 'can-red', w: 35, h: 48, x: 41, inX: 70, inBottom: 225, lean: -7, front: true },
  { file: 'can-tall-orange', w: 37, h: 76, x: 83, inX: 100, inBottom: 224, lean: -4, front: false },
  { file: 'bottle-clear', w: 36, h: 94, x: 127, inX: 148, inBottom: 226, lean: 3, front: false },
  { file: 'can-slim-dark', w: 29, h: 62, x: 170, inX: 194, inBottom: 224, lean: 6, front: false },
  { file: 'can-blue', w: 36, h: 51, x: 206, inX: 214, inBottom: 226, lean: 8, front: true },
  { file: 'can-mini-lime', w: 30, h: 49, x: 249, inX: 143, inBottom: 228, lean: -3, front: true },
] as const;
const ROW_BOTTOM = 110; // the line the waiting cans stand on, clear of the box
const pct = (n: number) => `${(n / GRID) * 100}%`;

function BoxBack({ viewBox }: { viewBox: string }) {
  return (
    <svg viewBox={viewBox} className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="box-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f4c2b" />
          <stop offset="1" stopColor="#4d331c" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="309" rx="128" ry="7" fill="rgba(43,29,18,0.13)" />
      {/* back flap, standing up behind the opening */}
      <path d="M70 170 L58 132 L262 132 L250 170 Z" fill="#c79a5c" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {/* side flaps, folded outward */}
      <path d="M40 205 L70 170 L42 160 L10 192 Z" fill="#e2b87a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M280 205 L250 170 L278 160 L310 192 Z" fill="#e2b87a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {/* the inside, seen through the open top */}
      <path d="M70 170 L250 170 L280 205 L40 205 Z" fill="url(#box-inside)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function BoxFront({ viewBox, full }: { viewBox: string; full: boolean }) {
  return (
    <svg viewBox={viewBox} className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="box-face" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dcb070" />
          <stop offset="1" stopColor="#cfa062" />
        </linearGradient>
      </defs>
      {/* front wall */}
      <path d="M40 205 L280 205 L268 308 L52 308 Z" fill="url(#box-face)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {/* front flap, folded down over the wall */}
      <path d="M40 205 L280 205 L287 231 L33 231 Z" fill="#e9c388" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {/* label */}
      <rect x="102" y="246" width="116" height="48" rx="7" fill="#fbf7ef" stroke={INK} strokeWidth="2.5" />
      <text x="160" y="267" textAnchor="middle" fontFamily="Architects Daughter, cursive" fontSize="17" fill="#c0392b">{full ? 'FULL!' : 'MI 10¢'}</text>
      <text x="160" y="285" textAnchor="middle" fontFamily="Architects Daughter, cursive" fontSize="12.5" fill={INK}>{full ? 'pick me up!' : 'cans + bottles'}</text>
    </svg>
  );
}

/**
 * The box. With `cans`, they wait in a row above it and drop inside once
 * `full`. Without, it is just the empty box (setup and error screens), and
 * the space the cans would need above it is cropped away.
 */
function BoxStage({ full = false, cans = false, burst = 0 }: { full?: boolean; cans?: boolean; burst?: number }) {
  const reduce = useReducedMotion();
  const top = cans ? 0 : 122; // crop the empty headroom when there are no cans
  const height = GRID - top;
  const viewBox = `0 ${top} ${GRID} ${height}`;
  return (
    <motion.div
      className="relative w-[min(84vw,340px)]"
      style={{ aspectRatio: `${GRID} / ${height}` }}
      // A small bump as the cans land.
      animate={burst && !reduce ? { y: [0, 0, 5, 0] } : undefined}
      transition={{ duration: 0.9, times: [0, 0.55, 0.7, 1] }}
    >
      <BoxBack viewBox={viewBox} />
      {cans && CANS.map((c, i) => (
        <motion.div
          key={c.file}
          className="absolute"
          style={{ width: pct(c.w), zIndex: c.front ? 2 : 1 }}
          initial={false}
          animate={
            full
              ? { left: pct(c.inX), top: pct(c.inBottom - c.h), rotate: c.lean }
              : { left: pct(c.x), top: pct(ROW_BOTTOM - c.h), rotate: 0 }
          }
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 17, delay: full ? i * 0.09 : 0 }}
        >
          {/* While waiting, the row rises and falls together as one slow wave. */}
          <motion.div
            animate={full || reduce ? { y: 0 } : { y: [0, -5, 0] }}
            transition={full || reduce ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          >
            <picture className="block">
              <source type="image/avif" srcSet={`/images/returnables/${c.file}.avif`} />
              <img src={`/images/returnables/${c.file}.webp`} alt="" className="block w-full h-auto" />
            </picture>
          </motion.div>
        </motion.div>
      ))}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <BoxFront viewBox={viewBox} full={full} />
      </div>
      <div className="absolute inset-x-0" style={{ top: pct(190 - top), zIndex: 4 }}>
        <Confetti run={burst} />
      </div>
    </motion.div>
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
    if (!code) { setView({ kind: 'missing' }); return; }
    setView({ kind: 'loading' });
    const { data, error } = await boxRpc<Box>('box_lookup', { p_code: code });
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
    // The NFC tag's link ends in ?from=tag and the QR code's in ?from=qr.
    // Count the scan (the Boxes tab shows whether a tag has ever been
    // used), then drop the ending so a refresh doesn't count twice.
    const via = new URLSearchParams(window.location.search).get('from');
    if (code && (via === 'tag' || via === 'qr')) {
      void boxRpc('box_scan', { p_code: code, p_via: via });
      try { window.history.replaceState(null, '', window.location.pathname); } catch { /* ignore */ }
    }
    void load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const request = async () => {
    if (!code) return;
    setBusy(true);
    const { data, error } = await boxRpc<{ already: boolean; box: Box }>('box_request_pickup', { p_code: code });
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
    if (!code) return;
    setBusy(true);
    const { data, error } = await boxRpc<Box>('box_claim', { p_code: code, p_school: school, p_room: room, p_teacher: teacher });
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

          {/* The stage: cans waiting above the box, dropping inside on request */}
          {(view.kind === 'ready' || view.kind === 'requested') && (
            <div className="flex justify-center mb-8">
              <BoxStage cans full={full} burst={burst} />
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
      <div className="flex justify-center mb-6"><BoxStage /></div>
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
      <div className="flex justify-center mb-6 opacity-80"><BoxStage /></div>
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
