import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => void;
  error?: string;
  isLoading?: boolean;
}

export default function LoginModal({ isOpen, onClose, onLogin, error, isLoading }: LoginModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-chalkboard/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="bg-chalkboard p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="w-12 h-12 bg-apple rounded-xl flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Admin Access</h2>
              <p className="text-white/50 text-sm mt-1">Please enter the administrator password.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold opacity-40">Password</label>
                <input 
                  autoFocus
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="••••••••"
                />
                {error && (
                  <p className="text-apple text-xs font-bold mt-2">{error}</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-apple text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-apple/90 transition-all disabled:opacity-50 shadow-lg"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>Access Dashboard</span>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
