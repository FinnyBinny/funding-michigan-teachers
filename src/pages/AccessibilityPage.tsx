import { useEffect } from 'react';
import { motion } from 'motion/react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EMAIL = 'hello@fundingmichiganteachers.org';

/**
 * Accessibility statement.
 *
 * Keep it true. "Known limits" lists what we know falls short; when one is
 * fixed, take it out, and when a new one is found, put it in. Update the
 * review date whenever the site is re-tested.
 */
export default function AccessibilityPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath('/accessibility'));
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
            Last reviewed October 2026
          </p>
          <h1 className="font-serif font-bold text-[clamp(2rem,6vw,3rem)] leading-[1.05] tracking-[-0.02em] mb-6">
            Accessibility
          </h1>
          <p className="text-chalkboard/75 leading-relaxed mb-12 text-lg font-light">
            Everyone should be able to use this site: to give, to ask for supplies, or to find out
            what we do. If something gets in your way, we want to hear about it.
          </p>

          <div className="space-y-9 text-chalkboard/75 leading-relaxed">
            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">The standard we work to</h2>
              <p>
                We test this site against the Web Content Accessibility Guidelines (WCAG) 2.2 at
                Level AA, the standard most U.S. organizations and courts look to. We are a small,
                student-run nonprofit and cannot promise every page meets every criterion at every
                moment, but it is the bar we hold ourselves to and check against.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">What we have done</h2>
              <p className="mb-3">
                In October 2026 we tested every page at desktop and phone sizes, with automated
                checks and by hand with a keyboard, and fixed what we found. The site now:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li>works with a keyboard alone, with a visible focus outline and a link to skip straight to each page's content;</li>
                <li>gives every form field a label, says plainly when something did not send, and announces confirmations to screen readers;</li>
                <li>uses text and background colours with enough contrast to read;</li>
                <li>lets text grow with your browser's text-size setting;</li>
                <li>turns off movement and animation if your device asks for reduced motion;</li>
                <li>describes its photos in words for people who cannot see them.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Known limits</h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li>
                  <strong className="text-chalkboard">The card form at checkout</strong> is
                  provided by our payment processor, Stripe, inside our page. We cannot change it,
                  and we have not yet been able to test it fully with a screen reader. If it gives
                  you trouble, email us and we will help you give another way.
                </li>
                <li>
                  <strong className="text-chalkboard">Some photos are of handwritten notes</strong>{' '}
                  on whiteboards. Where the words matter, they are in the photo's description.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-2">Tell us about a problem</h2>
              <p>
                Email{' '}
                <a href={`mailto:${EMAIL}?subject=Accessibility%20problem`} className="text-apple underline">{EMAIL}</a>{' '}
                with the page you were on and what happened. A student on our team reads every
                message. We will reply, tell you what we are changing, and help you do what you
                came to do in the meantime.
              </p>
            </section>
          </div>
        </motion.article>
      </main>

      <SiteFooter />
    </div>
  );
}
