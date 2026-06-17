import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ArrowLeft, ArrowRight, School, MapPin, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStories } from '../hooks/useLocalData';

const EASE = [0.32, 0.72, 0, 1] as const;

export default function TeacherStories() {
  const stories = useStories();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextStory = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };
  const prevStory = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Double-bezel outer shell — tighter padding */}
      <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        {/* Inner core */}
        <div className="bg-white rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">

          {/* TOP: attribution row (portrait + name + meta) — compact horizontal bar */}
          <div className="px-6 md:px-8 pt-6 pb-5 border-b border-chalkboard/5 flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`portrait-${currentStory.id ?? currentStory.name}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="shrink-0"
              >
                <div className="bg-chalkboard/5 ring-1 ring-chalkboard/8 rounded-2xl p-1">
                  {currentStory.image ? (
                    <img
                      src={currentStory.image}
                      alt={currentStory.name}
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-xl object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apple/15 to-pencil/15 flex items-center justify-center">
                      <School size={18} strokeWidth={1.25} className="text-apple/70" />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                key={`meta-${currentStory.id ?? currentStory.name}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
                className="min-w-0 flex-1"
              >
                <h3 className="font-serif font-bold text-base text-chalkboard leading-tight tracking-[-0.01em]">
                  {currentStory.name}
                </h3>
                <p className="text-[11px] text-chalkboard/50 font-light mt-0.5 truncate">
                  {currentStory.school} · {currentStory.location}
                </p>
              </motion.div>
            </AnimatePresence>

            <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] font-bold text-chalkboard/30">
              {String(currentIndex + 1).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}
            </span>
          </div>

          {/* MIDDLE: The quote — tight, readable, not screen-dominating */}
          <div className="px-6 md:px-8 py-7 md:py-9 relative">
            <Quote
              className="absolute top-5 right-5 text-apple/[0.06] -z-0 rotate-12"
              size={56}
              strokeWidth={1.25}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={`quote-${currentStory.id ?? currentStory.name}`}
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative z-10"
              >
                <blockquote className="font-serif text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-[1.5] text-chalkboard/85 mb-4">
                  <span className="text-apple italic font-normal">"</span>
                  {currentStory.impact}
                  <span className="text-apple italic font-normal">"</span>
                </blockquote>
                <p className="text-chalkboard/50 text-xs leading-relaxed font-light">
                  {currentStory.bio}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* BOTTOM bar — pagination + nav + share CTA */}
          <div className="border-t border-chalkboard/5 px-5 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-paper/30">
            <div className="flex items-center gap-1.5">
              {stories.map((s, i) => (
                <button
                  key={s.id ?? s.name}
                  onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                  aria-label={`View story ${i + 1}: ${s.name}`}
                  className={cn(
                    'h-1 rounded-full',
                    currentIndex === i ? 'bg-apple w-6' : 'bg-chalkboard/15 w-1 hover:bg-chalkboard/30',
                  )}
                  style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevStory}
                aria-label="Previous teacher story"
                className="w-8 h-8 rounded-full bg-white ring-1 ring-chalkboard/10 hover:ring-chalkboard/30 hover:bg-chalkboard hover:text-white flex items-center justify-center active:scale-95"
                style={{ transition: 'all 500ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <ArrowLeft size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={nextStory}
                aria-label="Next teacher story"
                className="w-8 h-8 rounded-full bg-white ring-1 ring-chalkboard/10 hover:ring-chalkboard/30 hover:bg-chalkboard hover:text-white flex items-center justify-center active:scale-95"
                style={{ transition: 'all 500ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <ArrowRight size={13} strokeWidth={1.5} />
              </button>

              <a
                href="mailto:hello@fundingmichiganteachers.org?subject=Share%20My%20Story"
                className="group flex items-center gap-1.5 bg-chalkboard text-white pl-3.5 pr-1 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-apple active:scale-[0.98] ml-1.5"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <Mail size={10} strokeWidth={1.5} />
                <span>Share</span>
                <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={10} strokeWidth={1.5} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
