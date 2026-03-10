import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('https://formspree.io/f/xpwrqkbv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: 'Newsletter Signup - Funding Michigan Teachers' })
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section className="py-32 px-6 bg-chalkboard relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[10px] font-bold mb-8 border border-apple/20 uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              <span>Stay Informed</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 leading-[0.9] tracking-tight">
              The <span className="text-apple italic font-normal">Impact</span> <br />
              Report.
            </h2>
            <p className="text-xl text-white/60 font-light leading-relaxed max-w-lg">
              Join 2,400+ supporters receiving monthly stories of how your generosity is transforming Michigan classrooms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 ml-2">Email Address</label>
                  <div className="relative">
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white placeholder:text-white/20 focus:ring-4 focus:ring-apple/20 outline-none transition-all text-lg"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-apple text-white py-6 rounded-2xl font-bold text-xl hover:bg-white hover:text-apple transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {status === 'loading' ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : status === 'success' ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <>
                      <span>Subscribe Now</span>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-4 bg-apple/10 border border-apple/20 rounded-xl text-apple text-center font-medium"
                  >
                    Thank you! You've been added to our list.
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center font-medium"
                  >
                    Something went wrong. Please try again.
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-8 text-[10px] text-white/30 text-center uppercase tracking-widest leading-relaxed">
                By subscribing, you agree to receive our monthly newsletter. <br />
                You can unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-apple/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
    </section>
  );
}
