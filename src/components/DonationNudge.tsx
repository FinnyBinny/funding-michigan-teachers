import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart } from 'lucide-react';

const STORAGE_KEY = 'fmt_nudge_dismissed';
const DELAY_MS = 5 * 60 * 1000; // 5 minutes

interface DonationNudgeProps {
  onDonate: () => void;
}

export default function DonationNudge({ onDonate }: DonationNudgeProps) {
  const [visible, setVisible] = useState(false);

  // sessionStorage throws in some private-browsing and blocked-cookie modes.
  // Unguarded, that exception took down the whole homepage, which has no
  // error boundary of its own.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* it simply shows again next visit */
    }
  };

  const handleDonate = () => {
    dismiss();
    onDonate();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          // Desktop only (phones have the Donate ribbon), bottom-left so it
          // never covers the Quick Answers button bottom-right. A polite
          // region rather than a dialog: it does not take focus, but a screen
          // reader hears it arrive.
          className="hidden lg:block fixed bottom-6 left-6 z-[60] w-80 bg-paper rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-chalkboard/10 overflow-hidden"
          role="region"
          aria-live="polite"
          aria-label="A note from Funding Michigan Teachers"
        >
          {/* Red accent bar matching primary brand color */}
          <div className="h-1 bg-apple w-full" />

          <div className="p-6 relative">
            <button
              onClick={dismiss}
              className="absolute top-2.5 right-2.5 p-2 rounded-full text-chalkboard/70 hover:text-chalkboard hover:bg-chalkboard/5 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-apple/10 flex items-center justify-center shrink-0">
                <Heart size={18} className="text-apple" />
              </div>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-apple">
                Support Teachers
              </p>
            </div>

            <p className="font-serif text-lg font-bold text-chalkboard leading-snug mb-2">
              Michigan teachers give everything. Can you give a little back?
            </p>
            <p className="text-sm text-chalkboard/75 font-light leading-relaxed mb-5">
              At least 80¢ of every dollar goes straight to teachers and classrooms, and nobody here takes a salary. Even $10/month makes a real difference.
            </p>

            <button
              onClick={handleDonate}
              className="btn-primary w-full justify-center text-sm py-3 px-6 text-base"
            >
              Donate to a Teacher →
            </button>
            <button
              onClick={dismiss}
              className="w-full text-center text-xs text-chalkboard/70 hover:text-chalkboard transition-colors mt-3 py-1.5"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
