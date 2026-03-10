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
  return "Great question! For more details, please reach out to us at hello@fundingmichiganteachers.org — we typically respond within 24 hours.";
}

export default function FAQAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm here to answer questions about Funding Michigan Teachers. Ask me anything, or pick a question below!" }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <motion.button
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 z-50 w-16 h-16 bg-apple text-white rounded-full shadow-2xl flex items-center justify-center group",
          isOpen && "hidden"
        )}
      >
        <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-pencil text-chalkboard text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce border-2 border-white">
          ?
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-50 w-[400px] max-h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-chalkboard/5 flex flex-col overflow-hidden"
          >
            <div className="bg-chalkboard p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-apple rounded-xl flex items-center justify-center">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="font-bold leading-none">Quick Answers</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Always Available</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold mt-1",
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
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-white border border-chalkboard/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple/20 focus:border-apple transition-all"
                />
                <button
                  onClick={() => handleSend()}
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
