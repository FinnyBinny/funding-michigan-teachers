import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 py-4 sm:py-8"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-chalkboard/5 shrink-0">
              <div>
                <h2 className="font-serif font-bold text-2xl text-chalkboard leading-none">Privacy Policy</h2>
                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Last updated March 2026</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close privacy policy"
                className="p-2 rounded-xl hover:bg-chalkboard/5 transition-colors text-chalkboard/40 hover:text-chalkboard"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-8 py-6 space-y-6 text-chalkboard/70 text-sm leading-relaxed">
              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Who We Are</h3>
                <p>
                  Funding Michigan Teachers ("FMT", "we", "us") is a student-led 501(c)(3) nonprofit organization
                  (EIN: 93-4485967) based in Okemos, Michigan. Our website is{' '}
                  <a href="https://fundingmichiganteachers.org" className="text-apple underline">
                    fundingmichiganteachers.org
                  </a>.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Information We Collect</h3>
                <p className="mb-3">We collect personal information only when you voluntarily provide it through:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Newsletter signups</strong> — your email address</li>
                  <li><strong>Contact form submissions</strong> — your name, email, and message</li>
                  <li><strong>Project submissions</strong> — your name, school, email, and project details</li>
                  <li><strong>Donations</strong> — processed securely by Zeffy; we do not store payment card data</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>To send our monthly impact newsletter (only if you subscribed)</li>
                  <li>To respond to your contact or project submission inquiries</li>
                  <li>To process and acknowledge donations</li>
                  <li>To improve our website and programs</li>
                </ul>
                <p className="mt-3">We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Cookies &amp; Analytics</h3>
                <p>
                  Our website may use basic analytics tools (such as Google Analytics) to understand
                  how visitors use our site. These tools may set cookies. You can disable cookies in
                  your browser settings at any time.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Data Retention</h3>
                <p>
                  We retain your information only as long as needed to fulfill the purpose for which
                  it was collected, or as required by law. Newsletter subscribers are removed upon
                  request. Contact and project submissions are retained for up to 2 years.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Your Rights</h3>
                <p>
                  You may request to access, correct, or delete any personal information we hold about
                  you. To unsubscribe from our newsletter or make a data request, email us at{' '}
                  <a href="mailto:hello@fundingmichiganteachers.org" className="text-apple underline">
                    hello@fundingmichiganteachers.org
                  </a>.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Children's Privacy</h3>
                <p>
                  Our website is not directed at children under 13. We do not knowingly collect personal
                  information from children under 13 without parental consent.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Changes to This Policy</h3>
                <p>
                  We may update this policy from time to time. The "last updated" date at the top will
                  reflect any changes. Continued use of our website after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-chalkboard text-base mb-2">Contact</h3>
                <p>
                  Questions about this policy? Reach us at{' '}
                  <a href="mailto:hello@fundingmichiganteachers.org" className="text-apple underline">
                    hello@fundingmichiganteachers.org
                  </a>{' '}
                  or by mail at: Funding Michigan Teachers, Okemos, MI 48864.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-8 py-5 border-t border-chalkboard/5 bg-paper/50">
              <button
                onClick={onClose}
                className="w-full bg-chalkboard text-white py-3 rounded-xl font-bold text-sm hover:bg-apple transition-all"
              >
                Got it — Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
