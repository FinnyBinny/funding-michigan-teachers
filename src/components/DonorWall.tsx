import { motion } from 'motion/react';
import { Award, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useDonors } from '../hooks/useLocalData';

export default function DonorWall() {
  const donors = useDonors();
  return (
    <div className="relative">
      <div className="flex flex-wrap justify-center gap-6 min-h-[400px] p-10 bg-paper/30 rounded-[3rem] border border-chalkboard/5 relative overflow-hidden">
        {donors.map((donor, index) => (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-6 rounded-2xl shadow-sm border border-chalkboard/5 flex flex-col items-center text-center max-w-[200px] transition-shadow hover:shadow-md text-chalkboard",
              donor.tier === 'Textbook Tycoon' ? "bg-apple/10 border-apple/20" :
              donor.tier === 'Ruler Rockstar' ? "bg-ruler/10 border-ruler/20" : "bg-white"
            )}
          >
            <div className={cn(
              "w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center",
              donor.tier === 'Textbook Tycoon' ? "bg-apple text-white" :
              donor.tier === 'Ruler Rockstar' ? "bg-ruler text-white" : "bg-pencil text-chalkboard"
            )}>
              {donor.tier === 'Textbook Tycoon' ? <Award size={20} /> : <Star size={20} />}
            </div>
            <h4 className="font-bold text-sm truncate w-full">{donor.name}</h4>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">{donor.tier}</p>
            {donor.message && (
              <p className="text-[11px] italic mt-3 text-chalkboard/60 line-clamp-2">"{donor.message}"</p>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-white/30 mt-6 font-bold uppercase tracking-widest">
        Donate today to see your name on our supporter wall
      </p>
    </div>
  );
}
