import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2, CheckCircle2, Award, Package, Heart } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { supabase } from '../lib/supabase';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { fileWithBloomerang } from '../lib/bloomerang';
import { track } from '../lib/analytics';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

/** The things we fill fastest — naming them lowers the bar to asking. */
const QUICK_FILLS = [
  'Pencils', 'Dry erase markers', 'Tissues', 'Paper', 'Notebooks', 'Markers',
];

const REASSURANCE = [
  { icon: Package, title: 'No application', body: 'No forms to chase, no committee, no grant cycle. You tell us what ran out; we work on getting it.' },
  { icon: Heart, title: 'Nothing comes out of your pocket', body: "That's the entire point of this organization. If you're buying it yourself, we haven't done our job." },
  { icon: Award, title: 'Ask small', body: "A box of tissues is a real request. Most of what teachers buy themselves is small, boring, and constant — that's exactly what we want to cover." },
];

/**
 * The page for the audience the site never spoke to directly.
 *
 * Every other page asks the visitor for something — a donation, a
 * sponsorship, a meeting. This one only offers. The single action is a
 * supply request, deliberately short: a teacher filling this in at 7pm
 * after a long day should be done in under a minute.
 */
/**
 * What a request is for.
 *
 * The Mid-Year Refill is the January restock, after the classroom budget has
 * run out and there is still half a school year left. It was the one program
 * with a donate button and no way for a teacher to say what they needed —
 * the ask existed only on the giving side.
 *
 * It is a field on this form rather than a form of its own: a teacher who
 * needs tissues in October and a cart in January is filling in the same four
 * boxes, and a second page would be the same questions twice.
 */
const REQUEST_KINDS = [
  { id: 'anytime', label: 'Something we ran out of (any time)' },
  { id: 'mid-year-refill', label: 'Mid-Year Refill — the January restock' },
] as const;

export default function ForTeachersPage() {
  /**
   * Deep links carry context so a teacher arriving from their own school's
   * page does not retype what that page already knew: /for-teachers?school=
   * Haslett%20High%20School&kind=mid-year-refill.
   */
  const params = new URLSearchParams(window.location.search);
  const initialKind = REQUEST_KINDS.some((k) => k.id === params.get('kind'))
    ? (params.get('kind') as string)
    : 'anytime';

  const [form, setForm] = useState({
    name: '', email: '', school: params.get('school') ?? '', needs: '', kind: initialKind,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'mailto'>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'Request Classroom Supplies | Funding Michigan Teachers',
      description:
        'Teach at Okemos, East Lansing or Haslett? Tell us what your classroom ran out of and we restock it. No application, no committee, no grant cycle.',
      path: '/for-teachers',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    let sent = false;
    const kindLabel = REQUEST_KINDS.find((k) => k.id === form.kind)?.label ?? 'Supply request';

    // Also file them in Bloomerang. Not awaited and never surfaced: the
    // visitor is told it went through by the delivery below, and a CRM
    // that is down is not their problem to see.
    void fileWithBloomerang('supplies', {
      name: form.name,
      email: form.email,
      note: `${kindLabel} — ${form.school}: ${form.needs}`,
    });

    sent = await submitToFormBold(FORMBOLD.supplies, {
      Form: form.kind === 'mid-year-refill' ? 'Mid-Year Refill request' : 'Teacher supply request',
      // The subject is what gets scanned in an inbox, so it leads with which
      // programme this is — a January refill is planned and budgeted
      // differently from a one-off restock.
      subject: `${kindLabel} — ${form.name} (${form.school})`,
      name: form.name,
      email: form.email,
      school: form.school,
      requestFor: kindLabel,
      needs: form.needs,
    });

    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: form.needs,
        type: 'supply-request',
        extra: { school: form.school, kind: form.kind },
      });
      if (!error) sent = true;
    }

    if (sent) {
      track('supply_request_submitted', { school: form.school, kind: form.kind });
      setStatus('success');
      setForm({ name: '', email: '', school: '', needs: '', kind: form.kind });
      return;
    }

    // Last resort: hand it to their mail app. Says what actually happened —
    // claiming "sent" here would be a lie if the client never opens.
    const subject = encodeURIComponent(`Supply request — ${form.name} (${form.school})`);
    const body = encodeURIComponent(`Teacher: ${form.name}\nSchool: ${form.school}\nEmail: ${form.email}\n\nWhat the classroom needs:\n${form.needs}`);
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`);
    setStatus('mailto');
  };

  const field = 'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-apple/10 focus:border-apple/40 outline-none transition-all placeholder:text-chalkboard/35';
  const label = 'block text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-2 ml-1';

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-10">
          <div className="pointer-events-none absolute top-0 right-0 w-[560px] h-[560px] bg-ruler/[0.06] rounded-full blur-[140px] translate-x-1/3 -translate-y-1/4" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-3xl mx-auto relative"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/50 mb-5">
              For Michigan Teachers
            </p>
            <h1 className="font-serif font-bold text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.03] tracking-[-0.02em] mb-6 text-balance">
              Stop buying it <span className="text-apple italic font-normal">yourself</span>.
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed">
              Tell us what your classroom has run out of. We'll work on getting it to you — no
              application, no cost, no catch. This is the whole reason we exist.
            </p>
          </motion.div>
        </section>

        {/* Quick fills */}
        <section className="px-4 sm:px-6 pb-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-chalkboard/60 font-light mb-4">
              The requests we fill fastest:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_FILLS.map((item) => (
                <span
                  key={item}
                  className="bg-white ring-1 ring-chalkboard/10 rounded-full px-4 py-2 text-sm font-medium text-chalkboard/75"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-sm text-chalkboard/55 font-light mt-4 italic">
              Something else? Ask anyway.
            </p>
          </div>
        </section>

        {/* Reassurance */}
        <section className="px-4 sm:px-6 py-12 bg-white/60">
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-5">
            {REASSURANCE.map((r) => (
              <div key={r.title}>
                <div className="w-10 h-10 rounded-xl bg-apple/10 text-apple flex items-center justify-center mb-3">
                  <r.icon size={18} strokeWidth={1.6} />
                </div>
                <h2 className="font-bold text-sm mb-1.5">{r.title}</h2>
                <p className="text-sm text-chalkboard/65 font-light leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The form — the page's single action */}
        <section id="request" className="px-4 sm:px-6 py-14">
          <div className="max-w-xl mx-auto">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl mb-2">What does your classroom need?</h2>
            <p className="text-chalkboard/60 font-light mb-8 text-sm">
              Five fields. Under a minute.
            </p>

            {status === 'success' || status === 'mailto' ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white ring-1 ring-apple/25 rounded-[1.75rem] p-8 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">
                  {status === 'mailto' ? 'Almost — one more tap' : 'Got it.'}
                </h3>
                <p className="text-sm text-chalkboard/70 font-light leading-relaxed">
                  {status === 'mailto'
                    ? "We opened your email app with the request ready. Press send there and it'll reach us."
                    : "We'll be in touch within a day or two. If it's on the quick list, it's usually straightforward."}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-5 text-sm font-bold text-apple hover:text-apple/80 transition-colors"
                >
                  Send another request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white ring-1 ring-chalkboard/8 rounded-[1.75rem] p-6 sm:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="mb-5">
                  <label htmlFor="teacher-kind" className={label}>What is this for?</label>
                  <select
                    id="teacher-kind" name="kind" value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value })}
                    className={field}
                  >
                    {REQUEST_KINDS.map((k) => (
                      <option key={k.id} value={k.id}>{k.label}</option>
                    ))}
                  </select>
                  {form.kind === 'mid-year-refill' && (
                    <p className="mt-2 text-sm text-chalkboard/60 font-light leading-snug">
                      Refills go out in January, so anything you send before then is in time.
                    </p>
                  )}
                </div>
                <div>
                    <label htmlFor="teacher-name" className={label}>Your name</label>
                    <input
                      id="teacher-name" name="name" required autoComplete="name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={field} placeholder="Ms. Freeman"
                    />
                  </div>
                  <div>
                    <label htmlFor="teacher-school" className={label}>School</label>
                    <input
                      id="teacher-school" name="organization" required autoComplete="organization"
                      value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}
                      className={field} placeholder="Okemos High School"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="teacher-email" className={label}>Email</label>
                  <input
                    id="teacher-email" name="email" type="email" required autoComplete="email"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={field} placeholder="you@school.org"
                  />
                </div>
                <div>
                  <label htmlFor="teacher-needs" className={label}>What do you need?</label>
                  <textarea
                    id="teacher-needs" name="message" required rows={4}
                    value={form.needs} onChange={(e) => setForm({ ...form, needs: e.target.value })}
                    className={`${field} resize-none`}
                    placeholder="A couple boxes of tissues and dry erase markers — we're out and it's only October."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-apple text-white py-3.5 rounded-xl font-bold text-base hover:bg-apple/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <span>Send my request</span>
                      <Send size={17} />
                    </>
                  )}
                </button>

                <p className="text-xs text-chalkboard/50 font-light text-center leading-relaxed">
                  Goes straight to Finn. Or email{' '}
                  <a href={`mailto:${EMAIL}`} className="text-apple underline">{EMAIL}</a>.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
