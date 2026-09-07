import { useEffect } from 'react';
import { motion } from 'motion/react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

/**
 * Privacy policy at a real, linkable URL.
 *
 * This used to be a modal that only existed on the homepage — unreachable from
 * the donation page, uncrawlable, and impossible to cite in a Google Ad Grants
 * or payment-processor review. It also still named Zeffy as the payment
 * processor long after checkout moved to Stripe.
 */
export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'Privacy Policy | Funding Michigan Teachers',
      description:
        'How Funding Michigan Teachers collects, uses, and protects your information — what we collect, why, how long we keep it, and how to request deletion.',
      path: '/privacy',
    });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper overflow-x-hidden relative flex flex-col">
      <SiteHeader />

      <main className="relative z-10 flex-1 px-4 sm:px-6 pt-28 sm:pt-32 pb-20">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/50 mb-4">
            Last updated September 2026
          </p>
          <h1 className="font-serif font-bold text-[clamp(2rem,6vw,3rem)] leading-[1.05] tracking-[-0.02em] mb-6">
            Privacy Policy
          </h1>
          <p className="text-chalkboard/70 leading-relaxed mb-12 text-lg font-light">
            Short version: we collect only what you hand us, we never sell it, and you can ask
            us to delete it at any time.
          </p>

          <div className="space-y-9 text-chalkboard/70 leading-relaxed">
            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Who we are</h2>
              <p>
                Funding Michigan Teachers ("FMT", "we", "us") is a student-led 501(c)(3) nonprofit
                organization (EIN: 93-4485967) based in Okemos, Michigan. Our website is{' '}
                <a href="https://www.fundingmichiganteachers.org" className="text-apple underline">
                  fundingmichiganteachers.org
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Information we collect</h2>
              <p className="mb-3">We collect personal information only when you voluntarily provide it through:</p>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li><strong>Newsletter signups</strong> — your email address.</li>
                <li><strong>Contact forms</strong> — your name, email, and message.</li>
                <li><strong>Project submissions</strong> — your name, school, email, and project details.</li>
                <li>
                  <strong>Returnables pickup requests</strong> — your name, email, phone, pickup
                  address, and any access details you give us (where the bags will be, or when
                  someone is home). We use this only to plan and complete the pickup.
                </li>
                <li>
                  <strong>Donations</strong> — processed securely by Stripe. Your card details go
                  directly to Stripe; we never see or store them. We receive your name, email, and
                  the amount so we can issue a receipt.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">How we use it</h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li>To send our impact newsletter (only if you subscribed).</li>
                <li>To reply to contact, project, sponsorship, and pickup requests.</li>
                <li>To process donations and send acknowledgements.</li>
                <li>To improve our website and programs.</li>
              </ul>
              <p className="mt-3">
                We do <strong>not</strong> sell, rent, or share your personal information with third
                parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Service providers</h2>
              <p>
                A few trusted services process data on our behalf: <strong>Stripe</strong> (payments),{' '}
                <strong>Supabase</strong> (our database, which stores form submissions and site
                content), <strong>FormBold</strong> (form delivery to our inbox), and{' '}
                <strong>Cloudflare</strong> (website hosting and security). Each handles your data
                under its own privacy policy.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Cookies &amp; analytics</h2>
              <p>
                We may use privacy-respecting analytics (such as Google Analytics) to understand how
                visitors use the site — which pages get read, which links get clicked. These tools may
                set cookies, and you can disable cookies in your browser settings at any time. We do
                not use advertising cookies or run ads on this website.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">How long we keep it</h2>
              <p>
                Only as long as needed for the purpose it was collected, or as required by law.
                Newsletter subscribers are removed on request. Contact and project submissions are
                kept for up to two years. Donation records are kept as long as nonprofit
                record-keeping rules require.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Your rights</h2>
              <p>
                You may ask us to access, correct, or delete any personal information we hold about
                you. To unsubscribe or make a request, email{' '}
                <a href={`mailto:${EMAIL}`} className="text-apple underline">{EMAIL}</a>. We'll act on
                it within a reasonable time and confirm when it's done.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Children's privacy</h2>
              <p>
                Our website is not directed at children under 13, and we do not knowingly collect
                personal information from them without parental consent. Students who participate in
                our school programs do so through their schools, not through this website.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Changes to this policy</h2>
              <p>
                We may update this policy from time to time. The "last updated" date above will
                reflect any change.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Contact</h2>
              <p>
                Questions about this policy? Reach us at{' '}
                <a href={`mailto:${EMAIL}`} className="text-apple underline">{EMAIL}</a> or by mail at
                Funding Michigan Teachers, Okemos, MI 48864.
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
