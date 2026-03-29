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

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
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
          className="fixed bottom-6 right-6 z-[60] w-80 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-chalkboard/5 overflow-hidden"
          role="dialog"
          aria-label="Donation prompt"
        >
          {/* Green accent bar */}
          <div className="h-1 bg-apple w-full" />

          <div className="p-6">
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-chalkboard/30 hover:text-chalkboard/60 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-apple/10 flex items-center justify-center shrink-0">
                <Heart size={18} className="text-apple" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-apple">
                Support Teachers
              </p>
            </div>

            <h3 className="text-lg font-serif font-bold text-chalkboard leading-snug mb-2">
              Michigan teachers give everything. Can you give a little back?
            </h3>
            <p className="text-sm text-chalkboard/55 font-light leading-relaxed mb-5">
              100% of every donation goes directly to teachers — no overhead, no exceptions. Even $10/month makes a real difference.
            </p>

            <button
              onClick={handleDonate}
              className="w-full bg-apple text-white py-3 rounded-2xl font-bold text-sm hover:bg-apple/90 active:scale-95 transition-all shadow-sm"
            >
              Donate to a Teacher →
            </button>
            <button
              onClick={dismiss}
              className="w-full text-center text-xs text-chalkboard/35 hover:text-chalkboard/55 transition-colors mt-3"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
