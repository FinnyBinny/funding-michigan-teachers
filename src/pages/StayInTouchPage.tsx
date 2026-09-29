import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { submitConstituent, loadBloomerang } from '../lib/bloomerang';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { track } from '../lib/analytics';

/**
 * The Bloomerang constituent form, in FMT's own markup.
 *
 * Bloomerang's copy-paste embed is not used here — see src/lib/bloomerang.ts
 * for why. This is a normal form on the site's own inputs, and on submit it
 * files the person into the CRM through Bloomerang's JavaScript API.
 *
 * It lives on its own route because Bloomerang permits one Constituent
 * Information form per page, and because loading its library (which brings
 * jQuery with it) on a page nobody asked for would undo the work that made
 * this site fast enough for the Ad Grant. Nothing else imports it.
 *
 * If Bloomerang is unreachable — blocked by an extension, down, or slow — the
 * submission still goes out through the site's normal form delivery, and the
 * page says plainly which of the two happened. Telling someone their details
 * were saved when the CRM refused them would be worse than a slow form.
 */

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR',
  'PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '',
  street: '', city: '', state: 'MI', zip: '', comment: '', optIn: true,
};

type Status = 'idle' | 'sending' | 'crm' | 'fallback' | 'error';

export default function StayInTouchPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'Stay in Touch | Funding Michigan Teachers',
      description:
        'Hear what Funding Michigan Teachers is doing in Okemos, East Lansing and Haslett — events, classroom supply drives, and how to help. A few times a year.',
      path: '/stay-in-touch',
    });
  }, []);

  /**
   * Start fetching Bloomerang the moment someone touches the form, not on
   * submit. Otherwise the first submit waits on jQuery downloading, which
   * reads as a broken button. Someone who lands and leaves pays nothing.
   */
  const warm = () => { loadBloomerang().catch(() => {}); };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await submitConstituent(form);
      track('newsletter_signup', { via: 'bloomerang' });
      setStatus('crm');
      setForm(EMPTY);
      return;
    } catch {
      // Fall through — the CRM is not the only way to reach FMT.
    }

    const sent = await submitToFormBold(FORMBOLD.newsletter, {
      Form: 'Stay in touch (Bloomerang unavailable)',
      subject: `Stay in touch — ${form.firstName} ${form.lastName}`,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      address: [form.street, form.city, form.state, form.zip].filter(Boolean).join(', '),
      message: form.comment,
      optIn: form.optIn ? 'yes' : 'no',
    });

    if (sent) {
      track('newsletter_signup', { via: 'fallback' });
      setStatus('fallback');
      setForm(EMPTY);
    } else {
      setStatus('error');
    }
  };

  const field = 'w-full bg-white border border-chalkboard/15 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-apple/10 focus:border-apple/40 transition-all';
  const label = 'block text-sm font-bold text-chalkboard/80 mb-1.5';

  if (status === 'crm' || status === 'fallback') {
    return (
      <div className="min-h-[100dvh] bg-paper flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-apple/10 text-apple flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="font-serif font-bold text-3xl mb-3">Thank you.</h1>
            <p className="text-chalkboard/70 font-light leading-relaxed">
              {status === 'crm'
                ? "You're on the list. We write a few times a year — what we did, where, and what it cost."
                : "We have your details and someone will add you to the list by hand. You will hear from us a few times a year."}
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-8">
          <div className="max-w-xl mx-auto">
            <h1 className="font-serif font-bold text-[clamp(2.25rem,6vw,3.25rem)] leading-[1.05] tracking-tight mb-5 text-balance">
              Stay in touch
            </h1>
            <p className="text-lg text-chalkboard/70 font-light leading-relaxed text-pretty">
              We write a few times a year: what we did, which building, and what it cost. No
              weekly newsletter, no selling your details to anyone.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-20">
          <form onSubmit={onSubmit} onFocusCapture={warm} className="max-w-xl mx-auto space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="firstName">First name</label>
                <input id="firstName" name="given-name" autoComplete="given-name" required
                       className={field} value={form.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label className={label} htmlFor="lastName">Last name</label>
                <input id="lastName" name="family-name" autoComplete="family-name" required
                       className={field} value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>

            <div>
              <label className={label} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                     className={field} value={form.email} onChange={set('email')} />
            </div>

            <div>
              <label className={label} htmlFor="phone">Phone <span className="font-normal text-chalkboard/50">(optional)</span></label>
              <input id="phone" name="tel" type="tel" autoComplete="tel"
                     className={field} value={form.phone} onChange={set('phone')} />
            </div>

            {/* Address is optional and says why it is being asked for, because
                a mailing address on a newsletter form looks like a lot to ask
                without a reason attached. */}
            <fieldset className="border-t border-chalkboard/10 pt-5">
              <legend className="sr-only">Mailing address</legend>
              <p className="text-sm text-chalkboard/60 font-light mb-4">
                Address is optional. We only use it for the occasional thank-you card.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={label} htmlFor="street">Street</label>
                  <input id="street" name="street-address" autoComplete="street-address"
                         className={field} value={form.street} onChange={set('street')} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className={label} htmlFor="city">City</label>
                    <input id="city" name="address-level2" autoComplete="address-level2"
                           className={field} value={form.city} onChange={set('city')} />
                  </div>
                  <div>
                    <label className={label} htmlFor="state">State</label>
                    <select id="state" name="address-level1" autoComplete="address-level1"
                            className={field} value={form.state} onChange={set('state')}>
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="zip">ZIP</label>
                    <input id="zip" name="postal-code" autoComplete="postal-code" inputMode="numeric"
                           className={field} value={form.zip} onChange={set('zip')} />
                  </div>
                </div>
              </div>
            </fieldset>

            <div>
              <label className={label} htmlFor="comment">Anything you want us to know? <span className="font-normal text-chalkboard/50">(optional)</span></label>
              <textarea id="comment" name="comment" rows={4}
                        className={field} value={form.comment} onChange={set('comment')} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" id="optIn" name="optIn" checked={form.optIn} onChange={set('optIn')}
                     className="mt-1 w-4 h-4 accent-[#c0392b] shrink-0" />
              <span className="text-sm text-chalkboard/75 font-light leading-snug">
                Yes, send me updates from Funding Michigan Teachers.
              </span>
            </label>

            {status === 'error' && (
              <p className="flex items-start gap-2 text-sm text-apple font-semibold">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  That did not go through. Email{' '}
                  <a href="mailto:hello@fundingmichiganteachers.org" className="underline">hello@fundingmichiganteachers.org</a>{' '}
                  and we will add you by hand.
                </span>
              </p>
            )}

            <button type="submit" disabled={status === 'sending'}
                    className="w-full bg-chalkboard text-white font-bold py-4 rounded-2xl hover:bg-apple transition-colors active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2">
              {status === 'sending' ? <><Loader2 size={18} className="animate-spin" /> Adding you…</> : 'Add me to the list'}
            </button>

            <p className="text-xs text-chalkboard/50 font-light text-center">
              We never sell or share your details. See our{' '}
              <a href="/privacy" className="underline">privacy policy</a>.
            </p>
          </form>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
