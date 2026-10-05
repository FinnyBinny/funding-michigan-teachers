import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Building2, ExternalLink, Send, Loader2, CheckCircle2, Gift } from 'lucide-react';
import CorporateSponsors from '../components/CorporateSponsors';
import SiteHeader from '../components/SiteHeader';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import SiteFooter from '../components/SiteFooter';
import { useFoodPartners, useSponsors } from '../hooks/useLocalData';
import { splitBusinessName } from '../lib/utils';
import type { FoodPartner } from '../data/initialData';
import { supabase } from '../lib/supabase';
import { submitToFormBold, FORMBOLD } from '../lib/forms';
import { fileWithBloomerang } from '../lib/bloomerang';
import { SendFailed, useFocusOnMount } from '../components/FormStatus';
import { track } from '../lib/analytics';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function SponsorsPage() {
  const foodPartners = useFoodPartners();
  const sponsors = useSponsors().filter(s => s.active !== false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/sponsors'));
  }, []);

  // All donations route through /donate, which hosts the embedded Stripe
  // checkout panel — one consistent, on-page payment flow site-wide.
  const handleDonate = (amount?: number) => {
    // A sponsorship level is a yearly amount, paid once. /donate used to open
    // these on monthly, so "$250 a year" became $250 a month.
    navigate(amount && amount > 0 ? `/donate?amount=${amount}&frequency=once` : '/donate');
  };

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">

      <SiteHeader />

      <main id="main">

        {/* Page Hero */}
        <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-6 classroom-grid relative overflow-hidden">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-ruler/10 text-ruler px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-8 uppercase tracking-widest border border-ruler/20">
                <Building2 size={13} aria-hidden="true" />
                <span>For Businesses</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[0.95] mb-6 text-balance">
                Put your business behind{' '}
                <span className="text-apple italic font-normal">local teachers</span>.
              </h1>
              <p className="text-lg text-chalkboard/70 max-w-2xl mx-auto leading-relaxed font-light mb-10">
                Local businesses feed and thank the staff at three mid-Michigan high schools. Back a staff
                meeting, a school or a whole year, and we make sure the people you helped know it was you.
              </p>
              <p className="text-[0.6875rem] text-chalkboard/70 font-bold uppercase tracking-widest">
                501(c)(3) Nonprofit · EIN 93-4485967 · 80¢+ of every dollar to teachers
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sponsor Tiers */}
        <section className="pt-2 pb-12 sm:pb-16 px-6">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
            <h2 id="levels-heading" className="sr-only">Sponsorship levels</h2>
            <CorporateSponsors onDonate={handleDonate} />
          </div>
        </section>

        {/* Current Sponsors Wall — driven by admin */}
        {sponsors.length > 0 && (
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-paper relative">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 bg-ruler/10 text-ruler ring-1 ring-ruler/20 px-3.5 py-1.5 rounded-full text-[0.625rem] font-bold mb-6 uppercase tracking-[0.24em]"
                >
                  <Building2 size={11} />
                  Our Corporate Partners
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight tracking-[-0.01em]">
                  Standing with us <span className="text-ruler italic font-normal">today</span>.
                </h2>
                <p className="text-chalkboard/70 max-w-xl mx-auto font-light leading-relaxed">
                  These businesses chose to back Michigan teachers in a visible, public way. They didn't have to — they did.
                </p>
              </div>

              <div
                className="rail-sm md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
                role="region"
                tabIndex={0}
                aria-label="Corporate partners"
              >
                {sponsors.map((sponsor, i) => {
                  const { name, detail } = splitBusinessName(sponsor.name);
                  const body = (
                    <div className="bg-white rounded-[1.5rem] ring-1 ring-chalkboard/[0.08] group-hover:ring-chalkboard/20 transition-colors p-6 h-full flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-apple bg-apple/10 px-2.5 py-1 rounded-full">
                          {levelLabel(sponsor)}
                        </span>
                        {sponsor.website && (
                          <ExternalLink size={13} className="text-chalkboard/70 group-hover:text-chalkboard transition-colors" aria-hidden="true" />
                        )}
                      </div>
                      {sponsor.logo && (
                        <div className="bg-chalkboard/[0.03] rounded-xl h-20 flex items-center justify-center mb-4 p-3">
                          <img src={sponsor.logo} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <p className="font-serif font-bold text-xl text-chalkboard leading-tight">{name}</p>
                      {detail && <p className="text-xs text-muted mt-1">{detail}</p>}
                      {sponsor.description && (
                        <p className="text-chalkboard/75 text-[0.8125rem] leading-relaxed mt-3">{sponsor.description}</p>
                      )}
                    </div>
                  );
                  const motionProps = {
                    initial: { opacity: 0, y: 24 },
                    whileInView: { opacity: 1, y: 0 },
                    // Bottom inset only: on a phone these sit in a sideways
                    // row, and an all-sides inset kept the card peeking in
                    // from the right invisible.
                    viewport: { once: true, margin: '0px 0px -60px 0px' },
                    transition: { duration: 0.6, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] as const },
                  };
                  // Only a sponsor with a website is a link; the rest are not
                  // pretend links to "#".
                  return sponsor.website ? (
                    <motion.a
                      key={sponsor.id ?? sponsor.name}
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} (opens their website in a new tab)`}
                      className="group block"
                      {...motionProps}
                    >
                      {body}
                    </motion.a>
                  ) : (
                    <motion.div key={sponsor.id ?? sponsor.name} className="group" {...motionProps}>
                      {body}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Current In-Kind Partners */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-chalkboard relative overflow-hidden">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-6 uppercase tracking-widest border border-pencil/30"
              >
                <Heart size={13} />
                <span>In-Kind Partners</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                Businesses Already <span className="text-pencil italic font-normal">Showing Up</span>.
              </h2>
              <p className="text-white/70 max-w-xl mx-auto font-light leading-relaxed">
                Local businesses donate the food and gift cards for the staff meetings and appreciation weeks
                we run. Here is what each one gave.
              </p>
            </div>

            <InKindLedger partners={foodPartners} />
          </div>

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple/5 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
        </section>

        {/* Sponsor interest form — no mail app required */}
        <section id="sponsor-form" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-paper scroll-mt-24">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight tracking-[-0.01em]">
                Let's <span className="text-apple italic font-normal">talk</span>.
              </h2>
              <p className="text-chalkboard/70 max-w-xl mx-auto font-light leading-relaxed">
                Pick a level, or tell us what you have in mind: a specific school, a branded supply
                drive, food for a staff meeting. We'll reach out within a few days. No commitment.
              </p>
            </div>
            <SponsorInterestForm />
          </div>
        </section>

      </main>

      <SiteFooter />

    </div>
  );
}

/**
 * The level shown on a sponsor's card. A level is a promise at a price
 * ($250 and up); a smaller gift, such as a $25 gift certificate, is thanked
 * as a gift rather than shown under a level it did not reach.
 */
const LEVEL_MINIMUMS: Record<string, number> = {
  'Pencil Partner': 250,
  'Campus Champion': 500,
  "Principal's Circle": 1000,
  'Founding Patron': 2500,
};
function levelLabel(sponsor: { tier: string; amount?: number | null }): string {
  const min = LEVEL_MINIMUMS[sponsor.tier];
  if (min && typeof sponsor.amount === 'number' && sponsor.amount > 0 && sponsor.amount < min) return 'In-kind gift';
  return sponsor.tier;
}

/** Rows a phone shows before "Show all". */
const LEDGER_PHONE_ROWS = 5;

/**
 * Every in-kind gift, as a record: what month, who, what they gave.
 *
 * This replaced a grid of tall portrait photo cards. Most of the photos are
 * 4:3 landscape, so the cards cropped away most of each one; five gifts have
 * no photo and showed as empty brown panels; and the section ran to 5,700px
 * on a phone. A small thumbnail still shows the real evidence where there is
 * some, and a gift without a photo gets the business's initial instead of a
 * blank.
 */
function InKindLedger({ partners }: { partners: FoodPartner[] }) {
  const [showAll, setShowAll] = useState(false);
  const hidden = partners.length - LEDGER_PHONE_ROWS;

  return (
    <>
      <ul id="in-kind-ledger" className="grid md:grid-cols-2 md:gap-x-10 max-w-5xl mx-auto">
        {partners.map((partner, index) => {
          const { name, detail: aside } = splitBusinessName(partner.business);
          return (
            <li
              key={partner.id ?? `${partner.business}-${index}`}
              className={`flex gap-4 py-5 border-t border-white/10 ${!showAll && index >= LEDGER_PHONE_ROWS ? 'max-md:hidden' : ''}`}
            >
              <div className="w-24 h-[72px] sm:w-28 sm:h-[84px] rounded-xl overflow-hidden shrink-0 bg-white/[0.06] ring-1 ring-white/10">
                {partner.image ? (
                  <picture>
                    {partner.avif && <source srcSet={partner.avif} type="image/avif" />}
                    <img
                      src={partner.image}
                      alt={`What ${name} donated, ${partner.month}`}
                      width={900}
                      height={675}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/45" aria-hidden="true">
                    <Gift size={22} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[0.625rem] uppercase tracking-[0.2em] font-bold text-pencil">{partner.month}</p>
                <p className="text-white font-bold leading-snug mt-0.5">{name}</p>
                {aside && <p className="text-white/70 text-xs mt-0.5">{aside}</p>}
                <p className="text-white/80 text-sm leading-relaxed mt-1.5">{partner.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && !showAll && (
        <div className="md:hidden text-center mt-4">
          <button
            onClick={() => setShowAll(true)}
            aria-controls="in-kind-ledger"
            aria-expanded={showAll}
            className="text-sm font-bold text-pencil underline underline-offset-4 decoration-pencil/40 py-2"
          >
            Show all {partners.length} gifts
          </button>
        </div>
      )}
    </>
  );
}

/** Replaces the sponsor form once the enquiry has been delivered. */
function SponsorThanks() {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-2"
      >
        <div className="bg-white rounded-[calc(2rem-0.5rem)] p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-apple/10 ring-1 ring-apple/20 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-apple" />
          </div>
          <h3 ref={headingRef} tabIndex={-1} className="font-serif font-bold text-2xl text-chalkboard mb-2 outline-none">Got it — thank you.</h3>
          <p className="text-chalkboard/70 text-sm font-light leading-relaxed max-w-sm mx-auto">
            We'll reach out within a few days to talk through what a partnership could look like for your business.
          </p>
        </div>
      </motion.div>
  );
}

/**
 * Sponsor interest form — submits via Web3Forms (email notification) and
 * Supabase contact_submissions (type: 'sponsor'); falls back to mailto so
 * no inquiry is ever lost. Mirrors the pilot-school form on /for-schools.
 */
function SponsorInterestForm() {
  const inp = 'w-full bg-chalkboard/[0.03] ring-1 ring-chalkboard/10 focus:ring-2 focus:ring-apple/50 rounded-2xl px-5 py-3.5 text-sm text-chalkboard outline-none placeholder:text-chalkboard/65 transition-all';
  const lbl = 'block text-left text-[0.625rem] uppercase tracking-[0.2em] font-bold text-chalkboard/70 mb-1.5';

  const [form, setForm] = useState({ business: '', name: '', email: '', phone: '', level: 'Not sure yet', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    let submitted = false;

    // Also file them in Bloomerang. Not awaited and never surfaced: the
    // visitor is told it went through by the delivery below, and a CRM
    // that is down is not their problem to see.
    void fileWithBloomerang('sponsor', {
      name: form.name,
      email: form.email,
      phone: form.phone,
      note: `Sponsorship enquiry from ${form.business} (level: ${form.level}) — ${form.message}`,
    });

    if (await submitToFormBold(FORMBOLD.sponsor, {
      Form: 'Corporate sponsorship inquiry',
      subject: `Corporate Sponsorship Inquiry — ${form.business}`,
      Business: form.business,
      'Contact Name': form.name,
      Phone: form.phone,
      Level: form.level,
      Message: form.message,
      email: form.email,
    })) submitted = true;

    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: form.message,
        type: 'sponsor',
        extra: { business: form.business, phone: form.phone, level: form.level },
      });
      if (!error) submitted = true;
    }

    if (submitted) track('sponsor_inquiry_submitted');
    setStatus(submitted ? 'success' : 'error');
  };

  const mailto = () => {
    const subject = encodeURIComponent(`Corporate Sponsorship Inquiry — ${form.business}`);
    const body = encodeURIComponent(`Business: ${form.business}\nContact: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nLevel: ${form.level}\n\n${form.message}`);
    return `mailto:hello@fundingmichiganteachers.org?subject=${subject}&body=${body}`;
  };

  if (status === 'success') {
    return <SponsorThanks />;
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8 }}
      className="max-w-2xl mx-auto bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-2 text-left"
    >
      <div className="bg-white rounded-[calc(2rem-0.5rem)] p-7 md:p-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sp-business" className={lbl}>Business Name</label>
            <input id="sp-business" autoComplete="organization" required value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className={inp} placeholder="Acme Coffee Co." />
          </div>
          <div>
            <label htmlFor="sp-name" className={lbl}>Contact Name</label>
            <input id="sp-name" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="Alex Rivera" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sp-email" className={lbl}>Email</label>
            <input id="sp-email" autoComplete="email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="you@business.com" />
          </div>
          <div>
            <label htmlFor="sp-phone" className={lbl}>Phone (optional)</label>
            <input id="sp-phone" autoComplete="tel" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="(517) 555-0100" />
          </div>
        </div>
        <div>
          <label htmlFor="sp-level" className={lbl}>Level you're considering</label>
          <select id="sp-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inp}>
            {['Not sure yet', 'Pencil Partner ($250)', 'Campus Champion ($500)', "Principal's Circle ($1,000)", 'Founding Patron ($2,500)', 'Food or goods for a staff meeting', 'Something else'].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sp-message" className={lbl}>What are you interested in?</label>
          <textarea id="sp-message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inp} placeholder="Sponsoring a school, donating food or gift cards, something else…" />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="group flex items-center gap-3 bg-apple text-white pl-7 pr-2 py-2 rounded-full font-bold shadow-[0_15px_40px_rgba(192,57,43,0.35)] active:scale-[0.98] text-sm uppercase tracking-[0.18em] disabled:opacity-60 w-full sm:w-auto justify-center transition-all"
          >
            {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Start the Conversation</span>
            <span className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center group-hover:translate-x-1 transition-all">
              <Heart size={14} className="fill-current" />
            </span>
          </button>
          {status === 'error' && <div className="mt-4"><SendFailed mailto={mailto()} /></div>}
        </div>
      </div>
    </motion.form>
  );
}
