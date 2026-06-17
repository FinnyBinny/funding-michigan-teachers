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
    <div className="max-w-5xl mx-auto">
      {/* Double-bezel outer shell */}
      <div className="bg-chalkboard/[0.03] ring-1 ring-chalkboard/8 rounded-[2.5rem] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
        {/* Inner core */}
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">

          <div className="grid md:grid-cols-[1fr_auto] gap-0">
            {/* LEFT: The quote dominates */}
            <div className="p-8 md:p-14 lg:p-16 relative">
              {/* Decorative quote glyph — large, behind text */}
              <Quote
                className="absolute top-8 right-8 md:top-12 md:right-12 text-apple/[0.06] -z-0 rotate-12"
                size={120}
                strokeWidth={1.25}
              />

              <div className="relative z-10">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 bg-apple/10 text-apple ring-1 ring-apple/20 px-3 py-1 rounded-full text-[10px] font-bold mb-7 uppercase tracking-[0.24em]">
                  <span className="w-1 h-1 rounded-full bg-apple" />
                  Teacher Story · {String(currentIndex + 1).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStory.id ?? currentStory.name}
                    initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    {/* THE QUOTE — the hero of the card */}
                    <blockquote className="font-serif text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.15] tracking-[-0.01em] text-chalkboard/90 mb-8">
                      <span className="text-apple italic font-normal">"</span>
                      {currentStory.impact}
                      <span className="text-apple italic font-normal">"</span>
                    </blockquote>

                    {/* The bio — smaller, supporting context */}
                    <p className="text-chalkboard/55 text-base leading-relaxed font-light max-w-2xl">
                      {currentStory.bio}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT: Compact portrait + attribution rail */}
            <div className="bg-paper/40 px-8 py-8 md:p-10 md:w-[280px] flex md:flex-col items-center md:items-start justify-between md:justify-start gap-6 border-t md:border-t-0 md:border-l border-chalkboard/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory.id ?? currentStory.name}
                  initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
                  className="flex md:flex-col md:items-start items-center gap-5 md:gap-7"
                >
                  {/* Small portrait — was previously full-card-height; now a compact 80-96px square */}
                  <div className="shrink-0">
                    <div className="bg-chalkboard/5 ring-1 ring-chalkboard/8 rounded-[1.25rem] p-1">
                      {currentStory.image ? (
                        <img
                          src={currentStory.image}
                          alt={currentStory.name}
                          loading="lazy"
                          decoding="async"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-[calc(1.25rem-0.25rem)] object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[calc(1.25rem-0.25rem)] bg-gradient-to-br from-apple/15 to-pencil/15 flex items-center justify-center">
                          <School size={28} strokeWidth={1.25} className="text-apple/70" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name + meta */}
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-chalkboard/40 mb-2">Educator</p>
                    <h3 className="font-serif font-bold text-xl md:text-2xl text-chalkboard leading-tight tracking-[-0.01em] mb-3">
                      {currentStory.name}
                    </h3>
                    <div className="space-y-1.5 text-xs text-chalkboard/55 font-light">
                      <div className="flex items-center gap-2">
                        <School size={12} strokeWidth={1.5} className="text-apple shrink-0" />
                        <span className="truncate">{currentStory.school}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} strokeWidth={1.5} className="text-apple shrink-0" />
                        <span>{currentStory.location}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom bar — pagination + nav + share CTA */}
          <div className="border-t border-chalkboard/5 px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-4 bg-paper/30">
            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {stories.map((s, i) => (
                <button
                  key={s.id ?? s.name}
                  onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                  aria-label={`View story ${i + 1}: ${s.name}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    currentIndex === i ? 'bg-apple w-8' : 'bg-chalkboard/15 w-1.5 hover:bg-chalkboard/30',
                  )}
                  style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Prev / Next as compact icon pills */}
              <button
                onClick={prevStory}
                aria-label="Previous teacher story"
                className="group w-10 h-10 rounded-full bg-white ring-1 ring-chalkboard/10 hover:ring-chalkboard/30 hover:bg-chalkboard hover:text-white flex items-center justify-center active:scale-95"
                style={{ transition: 'all 500ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <ArrowLeft size={15} strokeWidth={1.5} />
              </button>
              <button
                onClick={nextStory}
                aria-label="Next teacher story"
                className="group w-10 h-10 rounded-full bg-white ring-1 ring-chalkboard/10 hover:ring-chalkboard/30 hover:bg-chalkboard hover:text-white flex items-center justify-center active:scale-95"
                style={{ transition: 'all 500ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <ArrowRight size={15} strokeWidth={1.5} />
              </button>

              {/* Share CTA — premium pill */}
              <a
                href="mailto:hello@fundingmichiganteachers.org?subject=Share%20My%20Story"
                className="group flex items-center gap-2 bg-chalkboard text-white pl-5 pr-1.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] hover:bg-apple active:scale-[0.98] ml-2"
                style={{ transition: 'all 600ms cubic-bezier(0.32,0.72,0,1)' }}
              >
                <Mail size={13} strokeWidth={1.5} />
                <span className="hidden sm:inline">Share Your Story</span>
                <span className="sm:hidden">Share</span>
                <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={11} strokeWidth={1.5} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
