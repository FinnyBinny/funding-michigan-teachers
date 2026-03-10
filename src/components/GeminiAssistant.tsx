import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Bot, 
  User,
  Heart,
  BookOpen
} from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your MI Teacher Fund assistant. How can I help you support Michigan's educators today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are a helpful, warm, and professional assistant for Funding Michigan Teachers, a student-led nonprofit.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm sorry, I couldn't process that. How else can I help?" }]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a little trouble connecting right now. Please try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
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
          1
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-50 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-chalkboard/5 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-chalkboard p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-apple rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold leading-none">Impact Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 notebook-line"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-ruler text-white" : "bg-apple/10 text-apple"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <BookOpen size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-ruler text-white rounded-tr-none" 
                      : "bg-white border border-chalkboard/5 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-lg bg-apple/10 text-apple flex items-center justify-center">
                    <Sparkles size={16} className="animate-spin" />
                  </div>
                  <div className="bg-white border border-chalkboard/5 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 className="animate-spin text-apple" size={20} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-paper border-t border-chalkboard/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our impact..."
                  className="w-full bg-white border border-chalkboard/10 rounded-2xl px-6 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-apple/20 focus:border-apple transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-apple text-white rounded-xl flex items-center justify-center hover:bg-apple/90 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-chalkboard/40 font-bold uppercase tracking-widest">
                <Sparkles size={10} />
                <span>Powered by Gemini Intelligence</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
