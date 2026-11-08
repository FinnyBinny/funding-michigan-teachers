import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Paintbrush, Vote, PartyPopper, Send, Loader2, CheckCircle2, Building2, Heart } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta, setPageStructuredData, breadcrumbs } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { supabase } from '../lib/supabase';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { fileWithBloomerang } from '../lib/bloomerang';
import { SendFailed, PrivacyNote, useFocusOnMount } from '../components/FormStatus';
import { track } from '../lib/analytics';
import { navLinkProps } from '../lib/navigate';
import { SCHOOLS } from '../../shared/schools';
import Honeypot from '../components/Honeypot';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';
const FIELD = 'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-apple/10 focus:border-apple/40 outline-none transition-all placeholder:text-chalkboard/65';
const LABEL = 'block text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 ml-1';

/**
 * The door decorating competition: FMT's first event, back for a fourth
 * December.
 *
 * What is stated here is what is known: four years running, Okemos High
 * School, over $500 in prizes, winners announced before winter break (the
 * site's event calendar carries the date). Categories, judges and the exact
 * prize split are decided each year at the kickoff, so the page says that
 * rather than inventing them.
 */

/** The photos, in the order they read best on a wide screen. */
const PHOTOS = [
  {
    n: 4,
    alt: "A classroom door papered in bright blue with paper snowflakes and a hand-drawn panel reading Snoopy's Math Lab, with Charlie Brown, Sally and Snoopy under a string of lights.",
    caption: "Snoopy's Math Lab, for a pre-calculus room.",
  },
  {
    n: 1,
    alt: 'A door drawn as Snoopy asleep on his doghouse, the roof a right triangle labelled a, b and c under a thought cloud reading a² + b² = c², with a sine curve of holiday lights across the top.',
    caption: 'The Pythagorean doghouse, under a sine wave of lights.',
  },
  {
    n: 3,
    alt: 'A door covered in brown paper as a gingerbread house, with a fanlight marked in radians, rows of theta-shaped candies, and two frosted windows labelled sin(x) and cos(x).',
    caption: 'A gingerbread house with sin(x) and cos(x) windows.',
  },
  {
    n: 5,
    alt: 'A door with a real tinsel tree hung with gold and red baubles against sky-blue paper, a menorah drawn beside it, paper snowflakes and a plush nutcracker; the window reads Happy Holidays.',
    caption: 'A tinsel tree, a menorah and a nutcracker on duty.',
  },
  {
    n: 2,
    alt: 'The Snoopy doghouse door seen from further back, in the hallway beside a classroom window with a Dogs Welcome sign.',
    caption: 'Same doghouse, from down the hall.',
  },
];

const STEPS = [
  {
    icon: Paintbrush,
    title: 'Decorate',
    body: 'Any classroom door in the building, any theme. Students and teachers plan it together; past doors have gone from gingerbread trigonometry to a full tinsel tree.',
  },
  {
    icon: Vote,
    title: 'The building votes',
    body: 'Staff and students walk the halls and pick their favourites. The louder the hallway gets, the better it is working.',
  },
  {
    icon: PartyPopper,
    title: 'Winners before break',
    body: 'Prizes are handed out before winter break, and the winning doors go on our Instagram.',
  },
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

export default function DoorDecoratingPage() {
  const [form, setForm] = useState({ name: '', email: '', school: SCHOOLS[0]?.name ?? '', room: '', role: 'teacher', theme: '' });
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

  const roleLabel = ROLES.find((r) => r.id === form.role)?.label ?? form.role;

  const mailto = () => {
    const body = [`Name: ${form.name}`, `School: ${form.school}`, `Room: ${form.room}`, `Role: ${roleLabel}`, `Theme: ${form.theme}`].join('\n');
    return `mailto:${EMAIL}?subject=${encodeURIComponent('Door decorating competition')}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const note = [`Door decorating competition 2026: ${roleLabel}.`, `${form.school}${form.room ? `, room ${form.room}` : ''}.`, form.theme ? `Theme: ${form.theme}` : ''].filter(Boolean).join(' ');

    void fileWithBloomerang('doorDecorating', { name: form.name, email: form.email, note });

    let sent = await submitToFormBold(FORMBOLD.doorDecorating, {
      Form: 'Door decorating entry',
      subject: `Door decorating — ${form.name} (${form.school})`,
      name: form.name,
      email: form.email,
      school: form.school,
      room: form.room,
      role: roleLabel,
      theme: form.theme,
    });

    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: note,
        type: 'door-decorating',
        extra: { school: form.school, room: form.room, role: form.role, theme: form.theme },
      });
      if (!error) sent = true;
    }

    if (sent) {
      track('door_decorating_entry', { role: form.role });
      setStatus('sent');
    } else {
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main id="main" className="relative z-10 flex-1">
        {/* ── Hero ── */}
        <section className="relative px-4 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16">
          <div className="pointer-events-none absolute top-0 left-0 w-[560px] h-[560px] bg-pencil/[0.1] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/4" />
          <div className="max-w-7xl mx-auto relative grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-end">
            <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="max-w-2xl">
              <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-4">
                Fourth annual · December 2026 · Okemos High School
              </p>
              <h1 className="font-serif font-bold text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-4 text-balance">
                Door Decorating <span className="text-apple italic font-normal">Competition</span>
              </h1>
              <p className="text-lg text-chalkboard/75 font-light leading-relaxed">
                The event that started FMT, back for a fourth December. Classrooms turn their doors into
                gingerbread houses, doghouses and trigonometry, the whole building votes, and the winners
                take home a share of <strong className="font-semibold text-chalkboard">over $500 in prizes</strong>.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <a href="#enter" className="bg-chalkboard text-white px-6 py-3.5 rounded-full font-bold text-sm hover:bg-apple transition-colors inline-flex items-center gap-2">
                  Enter your door <Send size={14} aria-hidden="true" />
                </a>
                <a href="#sponsor" className="bg-white ring-1 ring-chalkboard/15 text-chalkboard px-6 py-3.5 rounded-full font-bold text-sm hover:bg-chalkboard/5 transition-colors">
                  Sponsor a prize
                </a>
              </div>
            </motion.header>

            <motion.aside
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
              aria-label="At a glance"
              className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)] p-6 grid grid-cols-2 gap-5"
            >
              {[
                { icon: Trophy, k: 'Prizes', v: '$500+' },
                { icon: Calendar, k: 'Winners', v: 'Dec 18' },
                { icon: Building2, k: 'Where', v: 'Okemos HS' },
                { icon: PartyPopper, k: 'Year', v: '4th' },
              ].map((s) => (
                <div key={s.k}>
                  <s.icon size={16} className="text-apple mb-2" aria-hidden="true" />
                  <p className="font-serif font-bold text-2xl leading-none">{s.v}</p>
                  <p className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mt-1.5">{s.k}</p>
                </div>
              ))}
            </motion.aside>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section aria-labelledby="gallery-heading" className="px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="max-w-7xl mx-auto">
            <h2 id="gallery-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-2">Doors from past years</h2>
            <p className="text-chalkboard/75 font-light leading-relaxed mb-8 max-w-2xl">
              The math department has a lot to answer for.
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {PHOTOS.map((p, i) => (
                <motion.li
                  key={p.n}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                  className={`${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  <figure className="bg-white rounded-[1.5rem] ring-1 ring-chalkboard/[0.08] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col">
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
                    </a>
                    <figcaption className="px-4 py-3 text-xs text-chalkboard/75 leading-snug">{p.caption}</figcaption>
                  </figure>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── How it works ── */}
        <section aria-labelledby="how-heading" className="bg-chalkboard text-white px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <h2 id="how-heading" className="font-serif font-bold text-2xl sm:text-3xl mb-10">How it works</h2>
            <ol className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="bg-white/5 rounded-[1.5rem] p-6 ring-1 ring-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-pencil text-chalkboard font-serif font-bold flex items-center justify-center">{i + 1}</span>
                    <s.icon size={18} className="text-pencil" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-2">{s.title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="text-sm text-white/70 leading-relaxed mt-8 max-w-2xl">
              Categories, judges and the exact prize split are announced at the kickoff in early December, once
              we know how many sponsors have joined. Questions before then: {' '}
              <a href={`mailto:${EMAIL}`} className="underline underline-offset-2 text-white">{EMAIL}</a>.
            </p>
          </div>
        </section>

        {/* ── History + Enter ── */}
        <section className="px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_480px] gap-12 items-start">
            <div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-6">Four Decembers</h2>
              <ol className="relative border-l border-chalkboard/15 ml-2 space-y-7">
                {HISTORY.map((h, i) => (
                  <li key={h.year} className="pl-6 relative">
                    <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${i === HISTORY.length - 1 ? 'bg-apple' : 'bg-chalkboard/30'}`} aria-hidden="true" />
                    <p className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-1">{h.year}</p>
                    <p className="text-sm text-chalkboard/80 leading-relaxed">{h.note}</p>
                  </li>
                ))}
              </ol>

              <div id="sponsor" className="mt-12 bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] p-6 sm:p-7 scroll-mt-28">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={16} className="text-apple" aria-hidden="true" />
                  <h3 className="font-serif font-bold text-xl">Put your name on a prize</h3>
                </div>
                <p className="text-sm text-chalkboard/75 leading-relaxed mb-5">
                  The prize pool is built by local businesses and families. A gift card, a pizza party for the
                  winning class, or cash toward the pool all count, and every sponsor is named when the winners
                  are announced.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a {...navLinkProps('/sponsors')} className="bg-chalkboard text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-apple transition-colors">
                    Sponsor as a business
                  </a>
                  <a {...navLinkProps('/donate')} className="bg-paper ring-1 ring-chalkboard/15 text-chalkboard px-5 py-3 rounded-full font-bold text-sm hover:bg-chalkboard/5 transition-colors">
                    Give to the prize pool
                  </a>
                </div>
              </div>
            </div>

            <div id="enter" className="scroll-mt-28">
              <div className="bg-white rounded-[1.75rem] ring-1 ring-chalkboard/[0.08] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8">
                {status === 'sent' ? (
                  <div role="status" className="text-center py-6">
                    <div className="w-14 h-14 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={26} aria-hidden="true" />
                    </div>
                    <h2 ref={successRef} tabIndex={-1} className="font-serif font-bold text-2xl mb-3 outline-none">You're in.</h2>
                    <p className="text-sm text-chalkboard/75 leading-relaxed">
                      We'll email you the kickoff details and the voting date. Start sketching.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <Honeypot />
                    <div>
                      <h2 className="font-serif font-bold text-2xl mb-1">Enter, help or sponsor</h2>
                      <p className="text-sm text-chalkboard/70 leading-relaxed">One short form for all three. We reply within a few days.</p>
                    </div>
                    <div>
                      <label htmlFor="dd-role" className={LABEL}>I am</label>
                      <select id="dd-role" value={form.role} onChange={set('role')} className={FIELD}>
                        {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dd-name" className={LABEL}>Name</label>
                        <input id="dd-name" required autoComplete="name" value={form.name} onChange={set('name')} className={FIELD} placeholder="Your name" />
                      </div>
                      <div>
                        <label htmlFor="dd-email" className={LABEL}>Email</label>
                        <input id="dd-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={FIELD} placeholder="you@school.org" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dd-school" className={LABEL}>School</label>
                        <select id="dd-school" value={form.school} onChange={set('school')} className={FIELD}>
                          {SCHOOLS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
                          <option value="Another Michigan school">Another Michigan school</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="dd-room" className={LABEL}>Room number {form.role !== 'teacher' && <span className="normal-case tracking-normal font-normal">(if you know it)</span>}</label>
                        <input id="dd-room" value={form.room} onChange={set('room')} className={FIELD} placeholder="214" maxLength={20} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="dd-theme" className={LABEL}>
                        {form.role === 'sponsor' ? 'What would you like to sponsor?' : 'Theme, if you have one'}{' '}
                        <span className="normal-case tracking-normal font-normal">(optional)</span>
                      </label>
                      <textarea id="dd-theme" rows={3} value={form.theme} onChange={set('theme')} className={FIELD} placeholder={form.role === 'sponsor' ? 'A $100 gift card, pizza for the winning class…' : 'Gingerbread house, but make it chemistry'} maxLength={500} />
                    </div>
                    <button type="submit" disabled={status === 'sending'} className="w-full bg-chalkboard text-white py-4 rounded-2xl font-bold hover:bg-apple transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      {status === 'sending' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                      {status === 'sending' ? 'Sending…' : 'Send it'}
                    </button>
                    {status === 'failed' && <SendFailed mailto={mailto()} />}
                    <PrivacyNote what="to send you the competition details and keep a record in our donor database" />
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
