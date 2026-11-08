import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown, Trophy, CalendarDays, School, Sparkles, Send, Loader2, CheckCircle2, PartyPopper, Gift,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import Honeypot from '../components/Honeypot';
import { setPageMeta, setPageStructuredData, breadcrumbs } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { supabase } from '../lib/supabase';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { fileWithBloomerang } from '../lib/bloomerang';
import { SendFailed, useFocusOnMount } from '../components/FormStatus';
import { track } from '../lib/analytics';
import { navLinkProps } from '../lib/navigate';
import { cn } from '../lib/utils';
import { SCHOOLS } from '../../shared/schools';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

/** The same field styles as the forms on /for-teachers. */
const FIELD = 'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-apple/10 focus:border-apple/40 outline-none transition-all placeholder:text-chalkboard/65';
const LABEL = 'block text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 ml-1';
const HINT = 'text-xs text-chalkboard/70 font-light mt-2 ml-1 leading-relaxed';

/**
 * The door decorating competition: FMT's first event, back for a fourth
 * December.
 *
 * Laid out like /internship (centered hero, a details card, centered section
 * headings, numbered steps, a dark closing card) and with the form styles of
 * /for-teachers, so it reads as part of the same site.
 *
 * What is stated here is what is known: four years running, Okemos High
 * School, over $500 in prizes, winners announced before winter break (the
 * event calendar carries the date). Categories, judges and the exact prize
 * split are decided each year at the kickoff, so the page says that rather
 * than inventing them.
 *
 * Captions describe what is on each door, never whose room or which
 * department it belongs to: the photos do not say, and a guess was wrong.
 *
 * Teachers who enter are asked whether their classroom needs supplies, as
 * FMT always does at the competition. The answer travels with the entry.
 */

const PHOTOS = [
  {
    n: 4,
    alt: 'A classroom door papered in bright blue with white paper snowflakes, and a hand-drawn panel of Charlie Brown, Sally and Snoopy under a string of holiday lights.',
    caption: 'Charlie Brown, Sally and Snoopy under the holiday lights.',
  },
  {
    n: 1,
    alt: 'A door drawn as Snoopy asleep on top of a doghouse wrapped in plaid gift paper, with a thought cloud above him, blue paper snowflakes, and a curving string of holiday lights across the top.',
    caption: 'Snoopy asleep on a gift-wrapped doghouse.',
  },
  {
    n: 3,
    alt: 'A door covered in brown paper as a gingerbread house, with white paper frosting outlining a fanlight, two windows and two wavy-lined panels, and a strip of snow along the bottom.',
    caption: 'A gingerbread-house door, frosting and all.',
  },
  {
    n: 5,
    alt: 'A door with a tinsel tree hung with gold and red baubles against sky-blue paper, a menorah drawn beside it, paper snowflakes and a plush nutcracker; the window beside it reads Happy Holidays.',
    caption: 'A tinsel tree, a menorah and a nutcracker on duty.',
  },
  {
    n: 2,
    alt: 'The Snoopy doghouse door seen from further back, in the hallway beside a classroom window.',
    caption: 'The doghouse door, from down the hall.',
  },
];

const DETAILS = [
  { icon: Trophy, label: 'Prizes', value: 'Over $500 in prizes for the winning doors' },
  { icon: CalendarDays, label: 'Winners', value: 'Announced December 18, before winter break' },
  { icon: School, label: 'Where', value: 'Okemos High School, any classroom door' },
  { icon: Sparkles, label: 'Our fourth year', value: 'The competition that started FMT, in December 2023' },
];

const STEPS: [string, string][] = [
  ['Enter your door', 'Send the form at the bottom of this page. Any classroom door, any theme.'],
  ['Decorate', 'Plan it with your students. Past doors have gone from gingerbread houses to a full tinsel tree.'],
  ['The building votes', 'Staff and students walk the halls and pick their favorites.'],
  ['Winners before break', 'Prizes go out before winter break, and the winning doors go on our Instagram.'],
];

/** Every year so far, from the site's event history. */
const HISTORY = [
  { year: 'December 2023', note: "FMT's very first event, weeks after incorporating. Winners announced December 23rd." },
  { year: 'December 2024', note: 'Back bigger, with the Okemos Fun Squad. Winners announced December 20th.' },
  { year: 'December 2025', note: 'Over $500 in prizes for the most creative doors in the building.' },
  { year: 'December 2026', note: 'Year four. Over $500 in prizes again, and room for more sponsors.' },
];

const ROLES = [
  { id: 'teacher', label: "I'm a teacher or staff member entering my door" },
  { id: 'student', label: "I'm a student who wants to help decorate" },
  { id: 'sponsor', label: "I'm a local business that would like to sponsor a prize" },
];

/** The requests filled fastest, as on /for-teachers. */
const QUICK_FILLS = ['Tissues', 'Pencils', 'Dry erase markers', 'Paper', 'Markers'];

function EnterButton() {
  return (
    <a
      href="#enter"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('enter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('enter-heading')?.focus({ preventScroll: true });
      }}
      className="group inline-flex items-center justify-center gap-3 bg-apple text-white pl-7 sm:pl-9 pr-2.5 py-3 rounded-full font-bold text-base sm:text-lg uppercase tracking-[0.1em] sm:tracking-[0.16em] whitespace-nowrap shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.98] min-h-[60px]"
    >
      Enter your door
      <span className="w-10 h-10 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-transform group-hover:translate-y-0.5">
        <ArrowDown size={17} aria-hidden="true" />
      </span>
    </a>
  );
}

export default function DoorDecoratingPage() {
  const [form, setForm] = useState({
    name: '', email: '', school: SCHOOLS[0]?.name ?? '', room: '', role: 'teacher', theme: '',
    needsSupplies: '' as '' | 'yes' | 'no', supplies: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const successRef = useFocusOnMount<HTMLHeadingElement>();

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/door-decorating'));
    setPageStructuredData(breadcrumbs([['Door Decorating Competition', '/door-decorating']]));
    return () => setPageStructuredData(null);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const isTeacher = form.role === 'teacher';
  const wantsSupplies = isTeacher && form.needsSupplies === 'yes' && form.supplies.trim() !== '';
  const roleLabel = ROLES.find((r) => r.id === form.role)?.label ?? form.role;
  const suppliesAnswer = !isTeacher ? '' : form.needsSupplies === 'yes' ? form.supplies.trim() || 'Yes (nothing listed)' : form.needsSupplies === 'no' ? 'No' : '';

  const mailto = () => {
    const body = [
      `Name: ${form.name}`, `School: ${form.school}`, `Room: ${form.room}`, `Role: ${roleLabel}`, `Theme: ${form.theme}`,
      isTeacher ? `Classroom supplies needed: ${suppliesAnswer || '(not answered)'}` : '',
    ].filter(Boolean).join('\n');
    return `mailto:${EMAIL}?subject=${encodeURIComponent('Door decorating competition')}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const note = [
      `Door decorating competition 2026: ${roleLabel}.`,
      `${form.school}${form.room ? `, room ${form.room}` : ''}.`,
      form.theme ? `Theme: ${form.theme}.` : '',
      wantsSupplies ? `Classroom supplies needed: ${form.supplies.trim()}` : '',
    ].filter(Boolean).join(' ');

    void fileWithBloomerang('doorDecorating', { name: form.name, email: form.email, note });

    let sent = await submitToFormBold(FORMBOLD.doorDecorating, {
      Form: 'Door decorating entry',
      // A supplies ask is flagged in the subject, so it is not missed in the
      // inbox behind the entry itself.
      subject: `Door decorating — ${form.name} (${form.school})${wantsSupplies ? ' + supplies request' : ''}`,
      name: form.name,
      email: form.email,
      school: form.school,
      room: form.room,
      role: roleLabel,
      theme: form.theme,
      suppliesNeeded: suppliesAnswer,
    });

    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: note,
        type: 'door-decorating',
        extra: {
          school: form.school, room: form.room, role: form.role, theme: form.theme,
          needsSupplies: isTeacher ? form.needsSupplies : '', supplies: wantsSupplies ? form.supplies.trim() : '',
        },
      });
      if (!error) sent = true;
    }

    if (sent) {
      track('door_decorating_entry', { role: form.role, supplies: wantsSupplies });
      setStatus('sent');
    } else {
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main id="main" className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-12">
          <div className="pointer-events-none absolute top-0 right-0 w-[560px] h-[560px] bg-apple/[0.06] rounded-full blur-[140px] translate-x-1/3 -translate-y-1/4" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-3xl mx-auto relative"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-5">
              Door Decorating Competition · December 2026
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-6 text-balance">
              Deck the halls. <span className="text-apple italic font-normal">Win for your classroom</span>.
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed mb-8">
              Our fourth annual door decorating competition. Classrooms turn their doors into
              gingerbread houses, snowy doghouses and tinsel trees, the whole building votes, and
              the winning doors take home a share of over $500 in prizes.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <EnterButton />
              <a href="#sponsor" className="text-base sm:text-lg font-bold text-chalkboard/75 hover:text-apple underline underline-offset-4 decoration-chalkboard/25 min-h-[44px] inline-flex items-center">
                Sponsor a prize
              </a>
            </div>
          </motion.div>
        </section>

        {/* The details */}
        <section className="px-4 sm:px-6 pb-12" aria-labelledby="details-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="details-heading" className="sr-only">The details</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-6 bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-8">
              {DETAILS.map((d) => (
                <li key={d.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-campaign-teal)]/15 text-[var(--color-campaign-teal)] flex items-center justify-center shrink-0">
                    <d.icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p>
                    <span className="block text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-1">{d.label}</span>
                    <span className="block text-base text-chalkboard/80 leading-snug">{d.value}</span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-chalkboard/70 font-light leading-relaxed">
              Categories, judges and the exact prize split are announced at the kickoff in early
              December, once we know how many sponsors have joined.
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section className="px-4 sm:px-6 py-14 bg-white/60" aria-labelledby="gallery-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="gallery-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-2 text-center">Doors from past years</h2>
            <p className="text-center text-chalkboard/70 font-light mb-9 max-w-2xl mx-auto">
              A few favorites from past competitions. Tap a photo to see it larger.
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {PHOTOS.map((p, i) => (
                <li key={p.n} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
                  <figure className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] overflow-hidden h-full flex flex-col">
                    <a href={`/images/door-decorating/door-${p.n}.jpg`} target="_blank" rel="noopener" className="block aspect-[3/4] bg-paper">
                      <picture>
                        <source srcSet={`/images/door-decorating/door-${p.n}.avif`} type="image/avif" />
                        <img
                          src={`/images/door-decorating/door-${p.n}.jpg`}
                          srcSet={`/images/door-decorating/door-${p.n}-320.jpg 320w, /images/door-decorating/door-${p.n}.jpg 900w`}
                          sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
                          alt={p.alt}
                          width={900}
                          height={1200}
                          loading={i < 2 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </picture>
                      <span className="sr-only">(opens the full-size photo in a new tab)</span>
                    </a>
                    <figcaption className="px-4 py-3 text-sm text-chalkboard/70 font-light leading-snug">{p.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works, and the history */}
        <section className="px-4 sm:px-6 py-14" aria-labelledby="steps-heading">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 lg:gap-14">
            <div>
              <h2 id="steps-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-6">How it works</h2>
              <ol className="space-y-5">
                {STEPS.map(([title, body], i) => (
                  <li key={title} className="flex gap-4 items-start">
                    <span className="w-9 h-9 rounded-full bg-chalkboard text-white font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="pt-1">
                      <p className="font-bold text-chalkboard">{title}</p>
                      <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-5">Four Decembers</h2>
              <ul className="space-y-5">
                {HISTORY.map((h) => (
                  <li key={h.year} className="flex items-start gap-3">
                    <PartyPopper size={18} strokeWidth={1.6} className="text-apple shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans font-bold text-base text-chalkboard mb-1">{h.year}</h3>
                      <p className="text-sm text-chalkboard/70 font-light leading-relaxed">{h.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* The entry form */}
        <section id="enter" aria-labelledby="enter-heading" className="px-4 sm:px-6 py-14 bg-white/60 scroll-mt-24">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-apple/10 text-apple flex items-center justify-center shrink-0">
                <Trophy size={18} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70">
                Enter the competition
              </p>
            </div>
            <h2 id="enter-heading" tabIndex={-1} className="font-serif font-bold text-2xl sm:text-3xl mb-2 outline-none">
              Enter your door
            </h2>
            <p className="text-chalkboard/70 font-light mb-8">
              Teachers entering a door, students who want to help, and businesses offering a prize all
              use this form. We reply within a few days.
            </p>

            {status === 'sent' ? (
              <div role="status" className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>
                <h3 ref={successRef} tabIndex={-1} className="font-serif font-bold text-2xl mb-3 outline-none">You're in.</h3>
                <p className="text-chalkboard/70 font-light leading-relaxed">
                  We'll email you the kickoff details and the voting date.
                  {wantsSupplies && ' We have your supply list too, and we will be in touch about it.'}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-8 space-y-5">
                <Honeypot />
                <div>
                  <label htmlFor="dd-role" className={LABEL}>Who's entering?</label>
                  <select id="dd-role" value={form.role} onChange={set('role')} className={FIELD}>
                    {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dd-name" className={LABEL}>Your name</label>
                    <input id="dd-name" required autoComplete="name" value={form.name} onChange={set('name')} className={FIELD} placeholder={form.role === 'sponsor' ? 'Your name and business' : 'Ms. Freeman'} />
                  </div>
                  <div>
                    <label htmlFor="dd-school" className={LABEL}>School</label>
                    <select id="dd-school" value={form.school} onChange={set('school')} className={FIELD}>
                      {SCHOOLS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
                      <option value="Another Michigan school">Another Michigan school</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="dd-email" className={LABEL}>Email</label>
                  <input id="dd-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={FIELD} placeholder="you@school.org" />
                </div>
                {form.role !== 'sponsor' && (
                  <div>
                    <label htmlFor="dd-room" className={LABEL}>Room number (or where to find the door)</label>
                    <input id="dd-room" value={form.room} onChange={set('room')} className={FIELD} placeholder="212" maxLength={40} />
                  </div>
                )}
                <div>
                  <label htmlFor="dd-theme" className={LABEL}>
                    {form.role === 'sponsor' ? 'What would you like to sponsor?' : 'Theme, if you have one'}
                  </label>
                  <textarea
                    id="dd-theme" rows={3} value={form.theme} onChange={set('theme')} className={FIELD} maxLength={500}
                    placeholder={form.role === 'sponsor' ? 'A $100 gift card, pizza for the winning class…' : 'A gingerbread house, a snowy doghouse…'}
                  />
                  <p className={HINT}>Optional.</p>
                </div>

                {/* FMT always asks entering teachers whether their room needs
                    anything. The answer is sent with the entry. */}
                {isTeacher && (
                  <fieldset className="border-t border-chalkboard/10 pt-5">
                    <legend className={cn(LABEL, 'pt-5 flex items-center gap-1.5')}>
                      <Gift size={12} aria-hidden="true" /> Does your classroom need any supplies?
                    </legend>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {([
                        { id: 'yes', title: 'Yes, we could use some', sub: 'Tell us what below' },
                        { id: 'no', title: "No, we're set for now", sub: 'You can always ask later' },
                      ] as const).map((o) => (
                        <label key={o.id} className="cursor-pointer">
                          <input
                            type="radio" name="needsSupplies" value={o.id} checked={form.needsSupplies === o.id}
                            onChange={() => setForm((f) => ({ ...f, needsSupplies: o.id }))}
                            className="sr-only peer"
                          />
                          <span className="flex gap-3 items-start h-full p-4 rounded-xl bg-paper border border-chalkboard/10 peer-checked:border-apple/50 peer-checked:bg-apple/[0.04] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ruler transition-colors">
                            <span className={cn('mt-0.5 w-4 h-4 rounded-full border-2 shrink-0', form.needsSupplies === o.id ? 'border-apple bg-apple shadow-[inset_0_0_0_3px_white]' : 'border-chalkboard/30')} aria-hidden="true" />
                            <span>
                              <span className="block text-sm font-bold text-chalkboard">{o.title}</span>
                              <span className="block text-xs text-chalkboard/70 font-light">{o.sub}</span>
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {form.needsSupplies === 'yes' && (
                      <div className="mt-4">
                        <label htmlFor="dd-supplies" className={LABEL}>What do you need, and how many?</label>
                        <textarea
                          id="dd-supplies" rows={3} value={form.supplies} onChange={set('supplies')} className={FIELD} maxLength={1000}
                          placeholder="2 boxes of tissues and a 12-pack of black dry erase markers"
                        />
                        <div className="flex flex-wrap gap-2 mt-3" aria-label="Requests we fill fastest">
                          {QUICK_FILLS.map((item) => (
                            <span key={item} className="bg-white ring-1 ring-chalkboard/10 rounded-full px-3 py-1.5 text-xs font-medium text-chalkboard/75">{item}</span>
                          ))}
                        </div>
                        <p className={HINT}>
                          Quantities help, and guessing is fine. For a bigger request, use{' '}
                          <a {...navLinkProps('/for-teachers')} className="underline underline-offset-2 hover:text-apple">the full supply request form</a>.
                        </p>
                      </div>
                    )}
                  </fieldset>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-apple text-white py-3.5 rounded-xl font-bold text-base hover:bg-apple/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === 'sending' ? <Loader2 className="animate-spin" size={20} aria-label="Sending" /> : (
                    <>
                      <span>{form.role === 'sponsor' ? 'Offer a prize' : form.role === 'student' ? 'Sign me up to help' : 'Enter my door'}</span>
                      <Send size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
                {status === 'failed' && <SendFailed mailto={mailto()} />}
                <p className="text-xs text-chalkboard/70 font-light text-center leading-relaxed">
                  Read by our student team and kept with your entry so we can follow up. See our{' '}
                  <a href="/privacy" className="underline underline-offset-2">privacy policy</a>, or email{' '}
                  <a href={`mailto:${EMAIL}`} className="underline underline-offset-2">{EMAIL}</a>.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Sponsor a prize */}
        <section id="sponsor" className="px-4 sm:px-6 py-14 pb-20 scroll-mt-24" aria-labelledby="sponsor-heading">
          <div className="max-w-3xl mx-auto bg-chalkboard rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12 text-center">
            <h2 id="sponsor-heading" className="font-serif font-bold text-2xl sm:text-3xl text-white mb-3">
              Put your name on a prize.
            </h2>
            <p className="text-white/75 font-light leading-relaxed max-w-xl mx-auto mb-8">
              The prize pool is built by local businesses and families. A gift card, a pizza party for
              the winning class, or cash toward the pool all count, and every sponsor is named when the
              winners are announced.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a {...navLinkProps('/sponsors')} className="bg-white text-chalkboard px-6 py-3 rounded-full font-bold text-sm hover:bg-paper transition-colors min-h-[44px] inline-flex items-center">
                Sponsor as a business
              </a>
              <a {...navLinkProps('/donate')} className="ring-1 ring-white/30 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors min-h-[44px] inline-flex items-center">
                Give to the prize pool
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
