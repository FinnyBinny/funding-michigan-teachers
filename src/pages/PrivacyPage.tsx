import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | Funding Michigan Teachers';
    return () => { document.title = 'Funding Michigan Teachers'; };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper">
      <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/85 backdrop-blur-2xl ring-1 ring-chalkboard/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-1 pl-2 pr-2 py-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-chalkboard/5"
            style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
          >
            <span className="w-7 h-7 rounded-full bg-chalkboard/5 flex items-center justify-center group-hover:bg-chalkboard/10">
              <ArrowLeft size={13} strokeWidth={1.5} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/60 hidden sm:inline">Home</span>
          </button>
        </div>
      </nav>

      <main id="main-content" className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-3">Legal</p>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl text-chalkboard leading-tight mb-2">Privacy Policy</h1>
            <p className="text-xs text-chalkboard/40 font-bold uppercase tracking-widest">Last updated March 2026</p>
          </div>

          <div className="space-y-8 text-chalkboard/70 text-[15px] leading-relaxed">
            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Who We Are</h2>
              <p>
                Funding Michigan Teachers ("FMT", "we", "us") is a student-led 501(c)(3) nonprofit organization
                (EIN: 93-4485967) based in Okemos, Michigan. Our website is{' '}
                <a href="https://fundingmichiganteachers.org" className="text-apple underline">
                  fundingmichiganteachers.org
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Information We Collect</h2>
              <p className="mb-3">We collect personal information only when you voluntarily provide it through:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Newsletter signups</strong> — your email address</li>
                <li><strong>Contact form submissions</strong> — your name, email, and message</li>
                <li><strong>Project submissions</strong> — your name, school, email, and project details</li>
                <li><strong>Donations</strong> — processed securely by Stripe or Zeffy; we do not store payment card data</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To send our monthly impact newsletter (only if you subscribed)</li>
                <li>To respond to your contact or project submission inquiries</li>
                <li>To process and acknowledge donations</li>
                <li>To improve our website and programs</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Cookies & Analytics</h2>
              <p>
                Our website may use basic analytics tools (such as Google Analytics) to understand
                how visitors use our site. These tools may set cookies. You can disable cookies in
                your browser settings at any time.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Data Retention</h2>
              <p>
                We retain your information only as long as needed to fulfill the purpose for which
                it was collected, or as required by law. Newsletter subscribers are removed upon
                request. Contact and project submissions are retained for up to 2 years.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Your Rights</h2>
              <p>
                You may request to access, correct, or delete any personal information we hold about
                you. To unsubscribe from our newsletter or make a data request, email us at{' '}
                <a href="mailto:hello@fundingmichiganteachers.org" className="text-apple underline">
                  hello@fundingmichiganteachers.org
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Children's Privacy</h2>
              <p>
                Our website is not directed at children under 13. We do not knowingly collect personal
                information from children under 13 without parental consent.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. The "last updated" date at the top will
                reflect any changes. Continued use of our website after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-chalkboard text-lg mb-3">Contact</h2>
              <p>
                Questions about this policy? Reach us at{' '}
                <a href="mailto:hello@fundingmichiganteachers.org" className="text-apple underline">
                  hello@fundingmichiganteachers.org
                </a>{' '}
                or by mail at: Funding Michigan Teachers, Okemos, MI 48864.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-chalkboard text-white py-8 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-white/30 text-xs">
          <span>&copy; {new Date().getFullYear()} Funding Michigan Teachers</span>
          <span className="font-mono uppercase tracking-widest text-[9px] px-3 py-1 bg-white/5 rounded-full">EIN: 93-4485967</span>
        </div>
      </footer>
    </div>
  );
}
