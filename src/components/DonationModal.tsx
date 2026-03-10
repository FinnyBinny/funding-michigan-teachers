import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Heart, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DONATION PLATFORM CONFIGURATION
//
// This modal embeds your donation platform directly on the page so visitors
// never leave the site.  Update the URL below to match your account:
//
//   GiveButter (current):
//     const EMBED_BASE = 'https://givebutter.com/fmt/donate';
//
//   Zeffy (recommended — iframes always work on Zeffy):
//     const EMBED_BASE = 'https://www.zeffy.com/en-US/embed/donation-form/YOUR_FORM_ID';
//     Get YOUR_FORM_ID from your Zeffy campaign → Share → Embed → iframe src
//
// ─────────────────────────────────────────────────────────────────────────────
const EMBED_BASE = 'https://givebutter.com/fmt/donate';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  frequency?: 'monthly' | 'once';
}

export default function DonationModal({ isOpen, onClose, amount, frequency = 'monthly' }: DonationModalProps) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build embed URL with optional amount pre-fill
  const embedUrl = amount
    ? `${EMBED_BASE}?amount=${amount}&frequency=${frequency}`
    : EMBED_BASE;

  // Fallback link (opens new tab if iframe is blocked by the payment provider)
  const fallbackUrl = amount
    ? `${EMBED_BASE}?amount=${amount}&frequency=${frequency}`
    : EMBED_BASE;

  // Reset loading state each time the modal opens or URL changes
  useEffect(() => {
    if (isOpen) setLoading(true);
  }, [isOpen, embedUrl]);

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="donation-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="donation-modal"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-chalkboard px-8 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-apple rounded-xl flex items-center justify-center">
                  <Heart size={20} className="text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-none">
                    {amount ? `Support for $${amount}/mo` : 'Support a Teacher'}
                  </h3>
                  <p className="text-white/50 text-xs mt-0.5">Secure donation — stays right here on the page</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs font-bold px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">New tab</span>
                </a>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Iframe area */}
            <div className="relative flex-1 overflow-hidden bg-paper" style={{ minHeight: 540 }}>
              {/* Loading spinner */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-paper gap-4 z-10"
                  >
                    <Loader2 className="animate-spin text-apple" size={36} />
                    <p className="text-sm text-chalkboard/50">Loading donation form…</p>
                    <a
                      href={fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-chalkboard/30 hover:text-apple transition-colors underline underline-offset-2 mt-2"
                    >
                      Taking too long? Open in new tab →
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <iframe
                ref={iframeRef}
                src={embedUrl}
                title="Donation Form"
                allow="payment"
                className="w-full h-full border-0"
                style={{ minHeight: 540 }}
                onLoad={() => setLoading(false)}
              />
            </div>

            {/* Footer note */}
            <div className="px-6 py-3 bg-paper/80 border-t border-chalkboard/5 flex items-center justify-between shrink-0">
              <p className="text-[10px] text-chalkboard/30 font-medium">
                🔒 Payments processed securely by GiveButter · 100% tax-deductible · EIN 93-4485967
              </p>
              <button onClick={onClose} className="text-[10px] text-chalkboard/30 hover:text-chalkboard transition-colors font-bold uppercase tracking-widest">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
