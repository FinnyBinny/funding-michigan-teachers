import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { FAQ_DATA } from '../data/initialData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function findAnswer(query: string): string {
  const q = query.toLowerCase();
  const match = FAQ_DATA.find(f =>
    f.question.toLowerCase().split(' ').some(word => word.length > 3 && q.includes(word))
  );
  if (match) return match.answer;
  return "We don't have a ready answer for that one. Email hello@fundingmichiganteachers.org and a student on our team will reply, usually within a day or two.";
}

export default function FAQAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm here to answer questions about Funding Michigan Teachers. Ask me anything, or pick a question below!" }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Opening moves focus into the panel; Escape closes it and hands focus back
  // to the button. Before, the button that had focus was hidden on open, so
  // focus fell to the page body and keyboard users were lost.
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: findAnswer(userMessage) }]);
    }, 400);
  };

  return (
    <>
      {/* Above the Donate ribbon on phones, where both sit at the bottom. */}
      <motion.button
        ref={launcherRef}
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        aria-label="Quick answers to common questions"
        aria-expanded={isOpen}
        aria-controls="faq-panel"
        className={cn(
          "fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50 w-14 h-14 lg:w-16 lg:h-16 bg-apple text-white rounded-full shadow-2xl flex items-center justify-center group",
          isOpen && "invisible"
        )}
      >
        <MessageSquare size={26} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
        <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-pencil text-chalkboard text-[0.625rem] font-bold rounded-full flex items-center justify-center border-2 border-white">
          ?
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="faq-panel"
            role="dialog"
            aria-labelledby="faq-title"
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-[70] w-[min(400px,calc(100vw-2rem))] max-h-[min(600px,calc(100dvh-2rem))] bg-white rounded-[2rem] shadow-2xl border border-chalkboard/10 flex flex-col overflow-hidden"
          >
            <div className="bg-chalkboard p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-apple rounded-xl flex items-center justify-center">
                  <BookOpen size={22} />
                </div>
                {/* It matches keywords against our FAQ; it is not a person
                    and not live. It used to say "Always Available" beside a
                    pulsing green dot, which reads as someone on the other end. */}
                <div>
                  <h2 id="faq-title" className="font-bold leading-none text-base">Quick Answers</h2>
                  <p className="text-[0.6875rem] text-white/75 mt-1">Answers from our FAQ. For anything else, email us.</p>
                </div>
              </div>
              <button onClick={close} aria-label="Close quick answers" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4" role="log" aria-live="polite" aria-label="Conversation">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[0.6875rem] font-bold mt-1",
                    msg.role === 'user' ? "bg-ruler text-white" : "bg-apple/10 text-apple"
                  )}>
                    {msg.role === 'user' ? 'You' : 'FMT'}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user'
                      ? "bg-ruler text-white rounded-tr-none"
                      : "bg-paper border border-chalkboard/5 rounded-tl-none text-chalkboard"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="shrink-0 p-4 bg-paper border-t border-chalkboard/5 space-y-3">
              <div className="grid grid-cols-1 gap-1.5">
                {FAQ_DATA.slice(0, 3).map(f => (
                  <button
                    key={f.question}
                    onClick={() => handleSend(f.question)}
                    className="text-left text-xs px-3 py-2.5 bg-white rounded-xl border border-chalkboard/5 hover:border-apple/30 hover:text-apple transition-all font-medium flex items-center gap-2 shadow-sm"
                  >
                    <ChevronRight size={12} className="shrink-0 text-apple" />
                    {f.question}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Your question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 min-w-0 bg-white border border-chalkboard/30 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  aria-label="Send question"
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-apple text-white rounded-xl flex items-center justify-center hover:bg-apple/90 transition-all disabled:opacity-40 shrink-0"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
