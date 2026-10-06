import { useEffect } from 'react';
import { motion } from 'motion/react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

/**
 * Privacy policy at a real, linkable URL.
 *
 * KEEP IT TRUE. When a tracker, form, processor or cookie is added or
 * removed, change this page in the same commit. Before any Google Ads
 * conversion or remarketing tag ships, replace the "does not currently use
 * advertising cookies" paragraph with Google's required disclosures (that
 * third-party vendors including Google show our ads and use cookies based on
 * past visits, and how to opt out via Ads Settings or the NAI page).
 *
 * This used to be a modal that only existed on the homepage — unreachable from
 * the donation page, uncrawlable, and impossible to cite in a Google Ad Grants
 * or payment-processor review. It also still named Zeffy as the payment
 * processor long after checkout moved to Stripe.
 */
export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/privacy'));
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main id="main" className="relative z-10 flex-1 px-4 sm:px-6 pt-28 sm:pt-32 pb-20">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-[0.625rem] uppercase tracking-[0.24em] font-bold text-chalkboard/70 mb-4">
            Last updated October 2026
          </p>
          <h1 className="font-serif font-bold text-[clamp(2rem,6vw,3rem)] leading-[1.05] tracking-[-0.02em] mb-6">
            Privacy Policy
          </h1>
          <p className="text-chalkboard/75 leading-relaxed mb-12 text-lg font-light">
            Short version: we keep what you send us so we can do what you asked, we measure how the
            site is used so we can improve it, we never sell anything about you, and you can ask us to
            delete what we hold.
          </p>

          <div className="space-y-10 text-chalkboard/75 leading-relaxed">
            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Who we are</h2>
              <p>
                Funding Michigan Teachers ("FMT", "we", "us") is a student-led 501(c)(3) nonprofit
                (EIN 93-4485967) based in Okemos, Michigan. This policy covers{' '}
                <a href="https://www.fundingmichiganteachers.org" className="text-apple underline">fundingmichiganteachers.org</a>.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">What you give us</h2>
              <ul className="list-disc list-outside pl-5 space-y-2">
                <li><strong className="text-chalkboard">Impact Report signup</strong>: your email address.</li>
                <li><strong className="text-chalkboard">Contact form</strong>: your name, email and message.</li>
                <li>
                  <strong className="text-chalkboard">Teacher supply requests</strong>: your name, email, school,
                  room, what your classroom needs, and the optional details you choose to add (what you
                  teach, how many students, what you have spent yourself), plus whether we may use your
                  name, a quote or a photo when we ask a business to help.
                </li>
                <li><strong className="text-chalkboard">Classroom project submissions</strong>: your name, school, email and the project.</li>
                <li><strong className="text-chalkboard">Bring FMT to your school</strong>: your name, role, school, district, email and staff size.</li>
                <li><strong className="text-chalkboard">Sponsorship enquiries</strong>: your business, name, email, phone and the level you are considering.</li>
                <li>
                  <strong className="text-chalkboard">Returnables pickups</strong>: your name, email, phone, address
                  and how we get the bags (where they will be, or when someone is home). The address and those
                  details are used only to plan and complete the pickup.
                </li>
                <li>
                  <strong className="text-chalkboard">Classroom returnables sign-ups</strong>: your name, email,
                  school and room, whether you would like a collection box, and any note you add.
                </li>
                <li>
                  <strong className="text-chalkboard">Youth Internship applications</strong>: made on Google Forms,
                  not on this site, so Google's privacy policy covers what you enter there. We receive your
                  answers and use them to review your application and contact you about it.
                </li>
                <li>
                  <strong className="text-chalkboard">Donations</strong>: processed by Stripe. Your card details
                  go to Stripe and never reach us. We receive your name, email, the amount, where you chose
                  to send it, whether it is monthly, and whether you covered the card fee, so we can thank
                  you, send a receipt and use the gift as you asked. A monthly gift is a subscription held
                  by Stripe until you ask us to change or cancel it.
                </li>
                <li>
                  <strong className="text-chalkboard">Shop orders</strong>: processed by Stripe. We receive your
                  name, email, phone and what you ordered, and your delivery address if you choose
                  delivery.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">What is collected automatically</h2>
              <ul className="list-disc list-outside pl-5 space-y-2">
                <li>
                  <strong className="text-chalkboard">Google Analytics 4</strong> records the pages you view, the
                  site you came from, the buttons and forms you use (for example that a donation was
                  completed and its amount, never your name or email), your device and browser type, and
                  your approximate location as worked out from your IP address. It uses cookies to tell
                  one visit from the next. See{' '}
                  <a href="https://policies.google.com/technologies/partner-sites" className="text-apple underline" target="_blank" rel="noopener noreferrer">how Google uses information from sites that use its services</a>.
                </li>
                <li>
                  <strong className="text-chalkboard">Bloomerang</strong>, our donor database, runs a
                  website-visit script on every page. It sets a cookie and records the pages you visit.
                  Those visits are connected to your record in our database only if Bloomerang can
                  identify you, for example after you click a link in an email we sent from Bloomerang.
                </li>
                <li>
                  <strong className="text-chalkboard">Stripe</strong> loads its payment script when you open a
                  checkout, and may set its own cookies there to prevent fraud.
                </li>
                <li>
                  <strong className="text-chalkboard">Cloudflare</strong>, which hosts the site, processes your IP
                  address and request details to deliver pages and block abuse, and keeps short-term logs.
                </li>
              </ul>
              <p className="mt-3">
                This site does not currently use advertising or remarketing cookies. We plan to run Google
                search ads; before we add any tag that measures or targets ads, we will update this policy
                to say so and how to opt out.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Cookies and storage, one by one</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <caption className="sr-only">Cookies and browser storage used by this site</caption>
                  <thead>
                    <tr className="border-b border-chalkboard/20 text-chalkboard">
                      <th scope="col" className="py-2 pr-4 font-bold">Name</th>
                      <th scope="col" className="py-2 pr-4 font-bold">Set by</th>
                      <th scope="col" className="py-2 font-bold">What it is for</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    {[
                      ['_ga, _ga_KJ7R4XRHX2', 'Google Analytics (cookie)', 'Tells one visit from the next for our site statistics. Google keeps it up to two years by default.'],
                      ['bloomerangConstituent', 'Bloomerang (cookie)', 'Lets Bloomerang connect your visits to your record if it knows who you are.'],
                      ['__stripe_mid, __stripe_sid', 'Stripe (cookie)', 'Fraud prevention, set only once you open a checkout.'],
                      ['fmt:shop-cart', 'This site (session storage)', 'Keeps your shop order until you close the tab.'],
                      ['fmt_voter_id', 'This site (local storage)', 'A random ID created only when you vote for a classroom project, so each browser votes once.'],
                      ['fmt:counted:…', 'This site (local storage)', 'Makes sure one donation or order is counted once in our statistics, not on every reload.'],
                      ['fmt_campaign_source, fmt_nudge_dismissed', 'This site (session storage)', 'Which flyer or link brought you here, and whether you closed the donation reminder.'],
                    ].map(([name, by, why]) => (
                      <tr key={name} className="border-b border-chalkboard/10">
                        <td className="py-2.5 pr-4 font-mono text-xs text-chalkboard break-all">{name}</td>
                        <td className="py-2.5 pr-4">{by}</td>
                        <td className="py-2.5">{why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">How we use it</h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li>To do what you asked: reply, restock a classroom, arrange a pickup, fill an order.</li>
                <li>To process gifts and orders, send receipts, and thank you.</li>
                <li>To keep a record of supporters, so we can tell you what your help did and ask again.</li>
                <li>To send the Impact Report, only if you signed up.</li>
                <li>To understand which pages work and improve the site.</li>
              </ul>
              <p className="mt-3">
                We do <strong className="text-chalkboard">not</strong> sell, rent or trade personal information, and we do not
                share it with anyone for their own marketing.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Who processes it for us</h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li><a href="https://stripe.com/privacy" className="text-apple underline" target="_blank" rel="noopener noreferrer">Stripe</a>: donations and shop payments.</li>
                <li><a href="https://bloomerang.com/privacy-policy/" className="text-apple underline" target="_blank" rel="noopener noreferrer">Bloomerang</a>: our donor database, holding form submissions, donations and orders, plus website-visit tracking.</li>
                <li><a href="https://policies.google.com/privacy" className="text-apple underline" target="_blank" rel="noopener noreferrer">Google</a>: Google Analytics, and Google Forms for internship applications.</li>
                <li><a href="https://supabase.com/privacy" className="text-apple underline" target="_blank" rel="noopener noreferrer">Supabase</a>: our database for site content and a backup copy of form submissions.</li>
                <li><a href="https://formbold.com/privacy" className="text-apple underline" target="_blank" rel="noopener noreferrer">FormBold</a>: delivers form submissions to our inbox.</li>
                <li><a href="https://www.cloudflare.com/privacypolicy/" className="text-apple underline" target="_blank" rel="noopener noreferrer">Cloudflare</a>: hosting and security.</li>
              </ul>
              <p className="mt-3">
                Each handles your information under its own privacy policy. We may also disclose information
                when the law requires it.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">How long we keep it</h2>
              <p>
                Donation records are kept as long as tax and nonprofit record-keeping rules require. Other
                submissions are kept while they are useful to our work with you. Newsletter subscribers
                are removed on request. Ask us at any time and we will delete what we are not required to
                keep.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Your choices</h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li>
                  Block or delete cookies in your browser settings; the site still works. To stop Google
                  Analytics in particular, use Google's{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" className="text-apple underline" target="_blank" rel="noopener noreferrer">opt-out add-on</a>.
                </li>
                <li>Unsubscribe from the Impact Report at any time.</li>
                <li>
                  Ask us to see, correct or delete what we hold about you, including your visit history in
                  Bloomerang, by emailing{' '}
                  <a href={`mailto:${EMAIL}?subject=Privacy%20request`} className="text-apple underline">{EMAIL}</a>. We will
                  confirm when it is done.
                </li>
                <li>
                  Browsers' "Do Not Track" setting has no agreed standard, and this site does not change what
                  it does in response to it; blocking cookies, above, is how to opt out.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Children</h2>
              <p>
                This site is not meant for children under 13, and we do not knowingly collect personal
                information from them. Students take part in our programs through their schools, not
                through this site. If you think a child under 13 has sent us information, email us and we
                will delete it.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Changes</h2>
              <p>
                When what the site collects changes, we update this page and the date at the top.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Contact</h2>
              <p>
                Questions about this policy? Email{' '}
                <a href={`mailto:${EMAIL}`} className="text-apple underline">{EMAIL}</a> or write to Funding
                Michigan Teachers, Okemos, MI 48864.
              </p>
            </section>
          </div>
        </motion.article>
      </main>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
