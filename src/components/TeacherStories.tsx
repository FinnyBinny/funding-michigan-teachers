import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, School, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStories } from '../hooks/useLocalData';

export default function TeacherStories() {
  const stories = useStories();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStory = () => setCurrentIndex((prev) => (prev + 1) % stories.length);
  const prevStory = () => setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);

  const currentStory = stories[currentIndex];

  if (!currentStory) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative bg-white rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] overflow-hidden border border-chalkboard/5 group/card">
        <div className="grid md:grid-cols-2 min-h-[700px]">
          {/* Image Section */}
          <div className="relative h-[500px] md:h-auto overflow-hidden">
            <AnimatePresence mode="wait">
              {currentStory.image ? (
                <motion.img
                  key={currentStory.image}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  src={currentStory.image}
                  width="600"
                  height="700"
                  className="w-full h-full object-cover"
                  alt={`Portrait of ${currentStory.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full bg-apple/5 flex flex-col items-center justify-center gap-6 p-12 text-center"
                >
                  <div className="w-32 h-32 bg-apple/10 rounded-full flex items-center justify-center text-apple">
                    <School size={64} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-chalkboard mb-2">{currentStory.name}</h3>
                    <p className="text-muted uppercase tracking-widest text-xs font-bold">Dedicated Michigan Educator</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-chalkboard/80 via-chalkboard/20 to-transparent md:hidden" />
            <div className="absolute bottom-10 left-10 text-white md:hidden">
              <h3 className="text-4xl font-serif font-bold mb-2">{currentStory.name}</h3>
              <p className="text-lg opacity-80 font-light">{currentStory.school}</p>
            </div>
            
            {/* Overlay for desktop */}
            <div className="absolute inset-0 bg-apple/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>

          {/* Content Section */}
          <div className="p-16 md:p-20 flex flex-col justify-center relative bg-paper/30">
            <Quote className="absolute top-12 right-12 text-apple/5 w-40 h-40 -z-10 rotate-12" />
            
            <div className="hidden md:block mb-12">
              <motion.div
                key={currentStory.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-5xl font-serif font-bold mb-4 leading-tight">{currentStory.name}</h3>
                <div className="flex flex-wrap gap-6 text-sm font-bold text-muted uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <School size={18} className="text-apple" />
                    <span>{currentStory.school}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-apple" />
                    <span>{currentStory.location}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-10">
              <motion.div
                key={`bio-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-apple mb-3">The Educator</p>
                <p className="text-xl text-chalkboard/70 leading-relaxed font-light italic">
                  "{currentStory.bio}"
                </p>
              </motion.div>

              <motion.div
                key={`impact-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-chalkboard/5 relative overflow-hidden group/impact"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-apple" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-apple mb-4">The Impact</p>
                <p className="text-2xl font-serif leading-relaxed text-chalkboard group-hover/impact:text-apple transition-colors duration-500">
                  {currentStory.impact}
                </p>
              </motion.div>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-between gap-8">
              <div className="flex gap-4">
                <button
                  onClick={prevStory}
                  aria-label="Previous story"
                  className="p-4 rounded-2xl border-2 border-chalkboard/5 hover:border-apple hover:text-apple transition-all active:scale-90 bg-white shadow-sm"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextStory}
                  aria-label="Next story"
                  className="p-4 rounded-2xl border-2 border-chalkboard/5 hover:border-apple hover:text-apple transition-all active:scale-90 bg-white shadow-sm"
                >
                  <ChevronRight size={28} />
                </button>
              </div>

              <a
                href="mailto:hello@fundingmichiganteachers.org?subject=Share%20My%20Story"
                className="flex items-center gap-3 bg-chalkboard text-white px-10 py-5 rounded-2xl font-bold hover:bg-apple transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <span className="text-lg">Share Your Story</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1 mt-12">
        {stories.map((story, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`View story ${i + 1}: ${story.name}`}
            aria-current={currentIndex === i ? 'true' : undefined}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full"
          >
            <span className={cn(
              "h-2 rounded-full transition-all duration-500 block pointer-events-none",
              currentIndex === i ? "bg-apple w-12" : "bg-chalkboard/10 w-2"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}
