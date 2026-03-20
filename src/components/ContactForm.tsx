import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, CheckCircle2, Mail, MapPin, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    let submitted = false;

    // Try Supabase first
    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        message: form.message,
        type: 'contact',
      });
      if (!error) submitted = true;
    }

    // Fallback: try Web3Forms
    if (!submitted && WEB3FORMS_KEY) {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Contact from ${form.name} — Funding Michigan Teachers`,
            name: form.name,
            email: form.email,
            message: form.message,
            replyto: form.email,
            from_name: form.name,
          }),
        });
        const data = await res.json();
        if (data.success) submitted = true;
      } catch { /* ignore */ }
    }

    if (submitted) {
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[10px] font-bold mb-8 border border-apple/20 uppercase tracking-[0.2em]">
          <MessageSquare size={14} />
          <span>Get in Touch</span>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-6 sm:mb-8 leading-[0.9] tracking-tight text-chalkboard">
          Let's <span className="text-apple italic font-normal">Connect</span>.
        </h2>
        <p className="text-lg sm:text-xl text-chalkboard/60 mb-8 sm:mb-12 font-light leading-relaxed max-w-md">
          Have questions about our mission or want to get involved? We're here to help you make an impact.
        </p>

        <div className="grid gap-8">
          {[
            { icon: Mail, label: 'Email Us', value: 'hello@fundingmichiganteachers.org' },
            { icon: MapPin, label: 'Our Location', value: 'Okemos, Michigan' }
          ].map(item => (
            <div key={item.label} className="flex items-start gap-6 group">
              <div className="w-16 h-16 bg-white border border-chalkboard/5 text-apple rounded-2xl flex items-center justify-center group-hover:bg-apple group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
                <item.icon size={28} />
              </div>
              <div className="pt-1">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted mb-1">{item.label}</div>
                <div className="text-xl font-bold text-chalkboard">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white p-6 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-chalkboard/5 relative"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/40 ml-2">Your Name</label>
              <input 
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-paper border border-chalkboard/5 rounded-2xl px-6 py-5 text-lg focus:ring-4 focus:ring-apple/10 outline-none transition-all placeholder:text-chalkboard/20" 
                placeholder="Sarah Jenkins"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/40 ml-2">Email Address</label>
              <input 
                required
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-paper border border-chalkboard/5 rounded-2xl px-6 py-5 text-lg focus:ring-4 focus:ring-apple/10 outline-none transition-all placeholder:text-chalkboard/20" 
                placeholder="sarah@example.com"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chalkboard/40 ml-2">Message</label>
            <textarea 
              required
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              rows={5}
              className="w-full bg-paper border border-chalkboard/5 rounded-2xl px-6 py-5 text-lg focus:ring-4 focus:ring-apple/10 outline-none transition-all resize-none placeholder:text-chalkboard/20" 
              placeholder="How can we help you?"
            />
          </div>
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-chalkboard text-white py-6 rounded-2xl font-bold text-xl hover:bg-apple transition-all shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 group"
          >
            {status === 'loading' ? (
              <Loader2 className="animate-spin" size={24} />
            ) : status === 'success' ? (
              <CheckCircle2 size={24} />
            ) : (
              <>
                <span>Send Message</span>
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
              className="mt-8 p-5 bg-apple/10 border border-apple/20 rounded-2xl text-apple text-center font-bold"
            >
              Message sent! We'll get back to you within 24 hours.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
