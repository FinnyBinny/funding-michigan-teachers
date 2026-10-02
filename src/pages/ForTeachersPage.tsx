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

/**
 * A select rather than free text, and this REDUCES typing rather than adding
 * it. As a text box, "OHS" / "Okemos HS" / "Okemos High School" were three
 * different strings in the CRM and in the analytics event, which made the
 * per-school split unreliable for anything a grantmaker would read.
 *
 * The values must match the deep links the school pages already carry
 * (/for-teachers?school=Haslett%20High%20School) or the prefill stops working.
 */
const SCHOOLS = [
  'Okemos High School',
  'East Lansing High School',
  'Haslett High School',
] as const;

const OTHER_SCHOOL = 'Another Michigan school';

/**
 * Triage, not accounting. Under $25 goes on the next supply run with nobody
 * having to decide anything; over $200 becomes an in-kind ask to a business —
 * the route that got Miss Abbott her garden cart and shelving from Home Depot.
 * "Not sure" leads, because pricing is FMT's job rather than the teacher's.
 */
const BUDGET_BANDS = [
  "Not sure — that's fine",
  'Under $25',
  '$25–$75',
  '$75–$200',
  'Over $200',
] as const;

/**
 * Four options rather than a date picker: mobile date pickers are slow, and FMT
 * runs on weekly supply runs plus the January refill, not on calendar dates.
 */
const TIMEFRAMES = [
  'No particular date',
  'This week',
  'This month',
  'Before winter break',
] as const;

/** Bands rather than a number, and "Rather not say" is a real answer. */
const OWN_SPEND = [
  'Not this time',
  'Yes — under $50 so far',
  'Yes — $50 to $200',
  'Yes — over $200',
  "Yes — honestly, I've stopped counting",
  'Rather not say',
] as const;

/**
 * Permission, captured at the moment a teacher is most willing to give it.
 *
 * FMT's donor letters name teachers — Miss Abbott's botany garden, Danielle
 * Tandoc's dissection lab — and the standing rule in shared/schools/*.ts is no
 * staff name without confirmed permission on file. Until now there was no
 * mechanism anywhere on the site to obtain that, which is why okemos.ts still
 * carries `advisor: undefined`.
 *
 * Unticked by default, and a tick is permission to ASK, not something that gets
 * published automatically.
 */
const PERMISSIONS = [
  { id: 'name', label: 'You can use my name when we ask a business or donor to cover this' },
  { id: 'quote', label: 'You can quote what I wrote above in letters and grant reports' },
  { id: 'photo', label: 'You can photograph the supplies in my room — no students in frame' },
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

  // A school arriving by deep link that isn't one of the three partner
  // buildings still prefills, as "Another Michigan school" plus its own name.
  const linkedSchool = params.get('school') ?? '';
  const knownSchool = SCHOOLS.some((s) => s === linkedSchool);

  const [form, setForm] = useState({
    name: '',
    email: '',
    school: knownSchool ? linkedSchool : linkedSchool ? OTHER_SCHOOL : '',
    schoolOther: knownSchool ? '' : linkedSchool,
    room: '',
    needs: '',
    link: '',
    budget: '',
    neededBy: '',
    subject: '',
    students: '',
    doingWithout: '',
    ownSpend: '',
    permissions: [] as string[],
    kind: initialKind,
  });

  /** The school as it should appear everywhere downstream. */
  const schoolName = form.school === OTHER_SCHOOL ? form.schoolOther.trim() : form.school;

  /**
   * The Mid-Year Refill has one delivery window for everybody, so the timing
   * question is hidden for it and the known date is recorded instead. A
   * teacher who picks a timeframe and then switches to the refill would
   * otherwise leave a stale answer behind in the note.
   */
  const isRefill = form.kind === 'mid-year-refill';
  const REFILL_DELIVERY = 'Week of January 12th (Mid-Year Refill delivery)';

  const togglePermission = (id: string) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(id)
        ? f.permissions.filter((p) => p !== id)
        : [...f.permissions, id],
    }));
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

    const permissionLabels = PERMISSIONS
      .filter((p) => form.permissions.includes(p.id))
      .map((p) => p.label);

    /**
     * The CRM note, as a labelled block rather than one run-on line.
     *
     * Every optional answer rides inside this existing free-text field, so
     * nothing changes in shared/crm, the Worker, or Bloomerang itself. Skipped
     * questions are omitted rather than printed empty — "Rough cost: —" is
     * noise in a note somebody has to read.
     */
    const noteLines = [
      `${kindLabel} — ${schoolName}${form.room ? `, room ${form.room}` : ''}`,
      form.subject && `Teaches: ${form.subject}`,
      (isRefill ? REFILL_DELIVERY : form.neededBy) &&
        `Needed by: ${isRefill ? REFILL_DELIVERY : form.neededBy}`,
      form.budget && `Rough cost: ${form.budget}`,
      form.students && `Students reached: ${form.students}`,
      form.ownSpend && `Buying it themselves: ${form.ownSpend}`,
      '',
      'Asked for:',
      form.needs,
      form.link && `\nLink: ${form.link}`,
      form.doingWithout && `\nGoing without: ${form.doingWithout}`,
      // Absence means no consent, matching the "permission on file" standard
      // the school files hold themselves to — so this line is omitted entirely
      // rather than printed as "Permission: none".
      permissionLabels.length && `\nPermission given: ${permissionLabels.join('; ')}`,
      '\nFiled from fundingmichiganteachers.org/for-teachers',
    ].filter(Boolean);

    // Also file them in Bloomerang. Not awaited and never surfaced: the
    // visitor is told it went through by the delivery below, and a CRM
    // that is down is not their problem to see.
    void fileWithBloomerang('supplies', {
      name: form.name,
      email: form.email,
      note: noteLines.join('\n'),
    });

    sent = await submitToFormBold(FORMBOLD.supplies, {
      Form: form.kind === 'mid-year-refill' ? 'Mid-Year Refill request' : 'Teacher supply request',
      // The subject is what gets scanned in an inbox, so it leads with which
      // programme this is — a January refill is planned and budgeted
      // differently from a one-off restock.
      subject: `${kindLabel} — ${form.name} (${schoolName})`,
      name: form.name,
      email: form.email,
      school: schoolName,
      room: form.room,
      requestFor: kindLabel,
      needs: form.needs,
      // Optional answers are sent as empty strings rather than omitted, so the
      // FormBold email keeps the same shape every time and a blank line is
      // visibly a blank rather than a field someone forgot to wire up.
      link: form.link,
      roughCost: form.budget,
      neededBy: isRefill ? REFILL_DELIVERY : form.neededBy,
      teaches: form.subject,
      studentsReached: form.students,
      goingWithout: form.doingWithout,
      buyingItThemselves: form.ownSpend,
      permissionGiven: permissionLabels.join('; '),
    });

    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: form.needs,
        type: 'supply-request',
        // extra is a jsonb column, so the new answers land as real queryable
        // keys here — this is the copy to count from for a grant report, not
        // the free-text CRM note.
        extra: {
          school: schoolName,
          kind: form.kind,
          room: form.room,
          link: form.link,
          budget: form.budget,
          neededBy: isRefill ? REFILL_DELIVERY : form.neededBy,
          subject: form.subject,
          students: form.students,
          doingWithout: form.doingWithout,
          ownSpend: form.ownSpend,
          permissions: form.permissions,
        },
      });
      if (!error) sent = true;
    }

    if (sent) {
      track('supply_request_submitted', { school: schoolName, kind: form.kind });
      setStatus('success');
      setForm({
        name: '', email: '', school: '', schoolOther: '', room: '', needs: '',
        link: '', budget: '', neededBy: '', subject: '', students: '',
        doingWithout: '', ownSpend: '', permissions: [], kind: form.kind,
      });
      return;
    }

    // Last resort: hand it to their mail app. Says what actually happened —
    // claiming "sent" here would be a lie if the client never opens.
    const subject = encodeURIComponent(`Supply request — ${form.name} (${schoolName})`);
    const body = encodeURIComponent(
      `Teacher: ${form.name}\nSchool: ${schoolName}${form.room ? `\nRoom: ${form.room}` : ''}\nEmail: ${form.email}\n\nWhat the classroom needs:\n${form.needs}`,
    );
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
                      Refills are all delivered the week of January 12th, so anything you send
                      before then is in time.
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
                    <select
                      id="teacher-school" name="organization" required
                      value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}
                      className={field}
                    >
                      <option value="" disabled>Pick your school</option>
                      {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                      <option value={OTHER_SCHOOL}>{OTHER_SCHOOL}</option>
                    </select>
                  </div>
                </div>

                {form.school === OTHER_SCHOOL && (
                  <div>
                    <label htmlFor="teacher-school-other" className={label}>Which school?</label>
                    <input
                      id="teacher-school-other" name="schoolOther" required
                      value={form.schoolOther}
                      onChange={(e) => setForm({ ...form, schoolOther: e.target.value })}
                      className={field} placeholder="Kinawa Middle School"
                    />
                    <p className="mt-2 text-sm text-chalkboard/60 font-light leading-snug">
                      We work in Okemos, East Lansing and Haslett today, but tell us anyway — it's
                      how we find out where to go next.
                    </p>
                  </div>
                )}
                <div>
                  <label htmlFor="teacher-email" className={label}>Email</label>
                  <input
                    id="teacher-email" name="email" type="email" required autoComplete="email"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={field} placeholder="you@school.org"
                  />
                </div>
                <div>
                  <label htmlFor="teacher-room" className={label}>
                    Room number (or where to find you)
                  </label>
                  <input
                    id="teacher-room" name="room" required
                    value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className={field} placeholder="212, or Media center"
                  />
                  <p className="mt-2 text-sm text-chalkboard/60 font-light leading-snug">
                    So we can walk it to you instead of leaving it at the office.
                  </p>
                </div>

                <div>
                  <label htmlFor="teacher-needs" className={label}>
                    What do you need, and how many?
                  </label>
                  <textarea
                    id="teacher-needs" name="message" required rows={4}
                    value={form.needs} onChange={(e) => setForm({ ...form, needs: e.target.value })}
                    className={`${field} resize-none`}
                    placeholder="2 boxes of tissues, a 12-pack of black dry erase markers, and 500 sheets of copy paper. We're out and it's only October."
                  />
                  <p className="mt-2 text-sm text-chalkboard/60 font-light leading-snug">
                    Quantities help — "2 boxes" is easier to fund than "some", and guessing is fine.
                    If it's for something specific, a lab or a garden or a reading corner, say so:
                    that sentence is usually what we put in the letter we send a business. Please
                    don't include student names.
                  </p>
                </div>

                <div>
                  <label htmlFor="teacher-link" className={label}>Link to the exact thing</label>
                  <input
                    id="teacher-link" name="link" type="url" inputMode="url"
                    value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className={field} placeholder="https://..."
                  />
                  <p className="mt-2 text-sm text-chalkboard/60 font-light leading-snug">
                    Optional. If you've already got it in a cart, paste the link — that's the
                    fastest request we can fill.
                  </p>
                </div>

                {/* "When do you need it?" is only a question for an any-time
                    request. Every Mid-Year Refill is delivered the same week,
                    so asking would invite an answer FMT cannot act on. */}
                <div className={isRefill ? '' : 'grid sm:grid-cols-2 gap-4'}>
                  <div>
                    <label htmlFor="teacher-budget" className={label}>
                      Roughly what would this cost?
                    </label>
                    <select
                      id="teacher-budget" name="roughCost" value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className={field}
                    >
                      <option value="">Optional</option>
                      {BUDGET_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {!isRefill && (
                    <div>
                      <label htmlFor="teacher-when" className={label}>When do you need it?</label>
                      <select
                        id="teacher-when" name="neededBy" value={form.neededBy}
                        onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
                        className={field}
                      >
                        <option value="">Optional</option>
                        {TIMEFRAMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacher-subject" className={label}>What do you teach?</label>
                    <input
                      id="teacher-subject" name="teaches"
                      value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={field} placeholder="Biology — or librarian, counselor, para"
                    />
                  </div>
                  <div>
                    <label htmlFor="teacher-students" className={label}>
                      How many students will this reach?
                    </label>
                    <input
                      id="teacher-students" name="studentsReached" type="number" min="0" inputMode="numeric"
                      value={form.students} onChange={(e) => setForm({ ...form, students: e.target.value })}
                      className={field} placeholder="Rough is fine"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="teacher-without" className={label}>
                    What are you doing without it right now?
                  </label>
                  <textarea
                    id="teacher-without" name="goingWithout" rows={2}
                    value={form.doingWithout}
                    onChange={(e) => setForm({ ...form, doingWithout: e.target.value })}
                    className={`${field} resize-none`}
                    placeholder="Sharing one set between four lab groups, so half the class watches."
                  />
                  <p className="mt-2 text-sm text-chalkboard/60 font-light leading-snug">
                    Optional, one line is plenty. This is usually the part we end up quoting when we
                    ask a business for help. Please don't include student names.
                  </p>
                </div>

                <div>
                  <label htmlFor="teacher-own-spend" className={label}>
                    Have you been buying this yourself?
                  </label>
                  <select
                    id="teacher-own-spend" name="buyingItThemselves" value={form.ownSpend}
                    onChange={(e) => setForm({ ...form, ownSpend: e.target.value })}
                    className={field}
                  >
                    <option value="">Optional</option>
                    {OWN_SPEND.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <fieldset>
                  <legend className={label}>Can we talk about this request?</legend>
                  <div className="space-y-3">
                    {PERMISSIONS.map((p) => (
                      <label key={p.id} className="flex gap-3 items-start cursor-pointer">
                        <input
                          type="checkbox" name={`permission-${p.id}`}
                          checked={form.permissions.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          className="mt-1 w-4 h-4 accent-apple shrink-0"
                        />
                        <span className="text-sm text-chalkboard/75 font-light leading-snug">
                          {p.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-chalkboard/60 font-light leading-snug">
                    All optional, and your request is treated exactly the same either way. A tick is
                    permission to ask — nothing goes public from this form on its own.
                  </p>
                </fieldset>

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
