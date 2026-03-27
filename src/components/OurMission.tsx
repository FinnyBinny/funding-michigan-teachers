import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, BookOpen, Star, GraduationCap, Apple, ChevronDown } from 'lucide-react';

const MISSION_POINTS = [
  {
    icon: Coffee,
    title: "Every Month, Without Fail",
    description: "During every staff meeting, we show up with real food from local Okemos businesses — Chick-Fil-A, Dunkin, Nothing Bundt Cakes, Hungry Howie's. Because a teacher who stayed until 7 PM deserves more than a granola bar.",
    color: "text-apple",
    bgColor: "bg-apple/10"
  },
  {
    icon: BookOpen,
    title: "Classroom Grants That Actually Land",
    description: "Teachers tell us what their classrooms need — lab tools, books, supplies — and we fund it directly. No grant committee. No 6-month wait. 100% of every dollar goes to the classroom.",
    color: "text-ruler",
    bgColor: "bg-ruler/10"
  },
  {
    icon: Star,
    title: "You're Seen. You're Valued.",
    description: "Door decorating competitions with $500+ in prizes. Student-written Valentine's letters. End-of-year appreciation certificates. We find every excuse to remind teachers: what you do matters, and people notice.",
    color: "text-pencil-dark",
    bgColor: "bg-pencil/20"
  }
];

export default function OurMission() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-apple/10 text-apple px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest">
            <GraduationCap size={14} />
            <span>Our Origin Story</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-[1.1] text-balance">
            Empowering Educators to <span className="text-apple italic font-normal">Inspire</span> the Next Generation.
          </h2>

          <p className="text-base text-chalkboard/70 mb-5 leading-relaxed font-light">
            Founded in November 2023 by Finn Regan — a 14-year-old from Okemos, Michigan who grew up watching teachers spend their own money on classrooms while no one said thank you. What started as a tradition of delivering coffee and donuts to school staff became a registered 501(c)(3) nonprofit dedicated to making sure educators feel valued every single month.
          </p>
          <p className="text-base text-chalkboard/70 leading-relaxed font-light">
            Since founding, FMT has raised over $4,000, served Okemos High School staff at every monthly meeting during the 2025–2026 school year, awarded $500+ in door decorating prizes, organized a Valentine's Day letter campaign, and funded classroom grants — all run by high school students, with 100% of donations going directly to teachers.
          </p>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-5 space-y-4 border-l-2 border-apple/20 pl-5">
                  <p className="text-base text-chalkboard/60 leading-relaxed font-light">
                    Finn grew up watching his mother work as a teacher — seeing firsthand how much time, effort, and personal money educators invest in their classrooms without recognition. Beginning in elementary school, he and his friends would deliver coffee and donuts to school staff as a simple gesture of thanks.
                  </p>
                  <p className="text-base text-chalkboard/60 leading-relaxed font-light">
                    That tradition continued through middle school and into high school. In November 2023, during his freshman year, Finn decided to make it permanent. He founded Funding Michigan Teachers as a student-led nonprofit, bringing in community partners and donors to sustain and scale the appreciation effort year-round.
                  </p>
                  <p className="text-base text-chalkboard/60 leading-relaxed font-light">
                    FMT has hosted two door decorating competitions awarding $500–$700 in prizes, delivered surprise staff meals from Chick-Fil-A, Dunkin', Nothing Bundt Cakes, and Hungry Howie's at staff meetings, and organized a student-written Valentine's Day letter campaign. Every initiative is entirely student-run — because Finn believes young people can make a real difference in their communities.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-5 mb-8 flex items-center gap-2 text-apple font-bold text-sm hover:text-apple/80 transition-colors"
          >
            <span>{expanded ? 'Show less' : 'Read the full story'}</span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={16} />
            </motion.div>
          </button>

          
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 group hover:border-apple/20 transition-colors">
              <div className="text-3xl font-serif font-bold text-apple mb-1 group-hover:scale-110 transition-transform origin-left">100%</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Direct to Classrooms</div>
            </div>
            <div className="p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 group hover:border-ruler/20 transition-colors">
              <div className="text-3xl font-serif font-bold text-ruler mb-1 group-hover:scale-110 transition-transform origin-left">3</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Schools Reached</div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {MISSION_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group p-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex gap-5 items-start"
            >
              <div className={`w-14 h-14 shrink-0 rounded-xl ${point.bgColor} ${point.color} flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 shadow-sm`}>
                <point.icon size={22} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold mb-2">{point.title}</h3>
                <p className="text-chalkboard/60 leading-relaxed font-light text-base">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 bg-chalkboard text-white rounded-3xl shadow-2xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-3">
                <Apple size={24} className="text-apple" />
                Join the Movement
              </h3>
              <p className="text-white/60 mb-5 text-sm font-light leading-relaxed">
                Whether you're a donor, a teacher, or a student, there's a place for you in our mission to transform Michigan education.
              </p>
              <button 
                onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-chalkboard px-10 py-4 rounded-2xl font-bold text-sm hover:bg-apple hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                Get Involved Today
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-apple/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -left-20 -top-20 w-60 h-60 bg-ruler/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
