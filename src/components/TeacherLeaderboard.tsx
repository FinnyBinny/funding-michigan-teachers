import { motion } from 'motion/react';
import { Trophy, Users, Star, TrendingUp, School } from 'lucide-react';
import { cn } from '../lib/utils';
import { PROJECTS } from '../data/initialData';

// Derive leaderboard from projects data
const leaderboard = Object.values(
  PROJECTS.reduce((acc, p) => {
    const key = `${p.teacher_name}|${p.school_name}`;
    if (!acc[key]) {
      acc[key] = { teacher_name: p.teacher_name, school_name: p.school_name, project_count: 0, total_votes: 0, total_raised: 0 };
    }
    acc[key].project_count += 1;
    acc[key].total_votes += p.votes;
    acc[key].total_raised += p.raised;
    return acc;
  }, {} as Record<string, { teacher_name: string; school_name: string; project_count: number; total_votes: number; total_raised: number }>)
).sort((a, b) => b.total_votes - a.total_votes);

export default function TeacherLeaderboard() {

  return (
    <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-chalkboard/5 overflow-hidden">
      <div className="bg-chalkboard p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-apple/10 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-apple/20 text-apple rounded-[2rem] flex items-center justify-center shadow-inner">
            <Trophy size={40} className="text-pencil" />
          </div>
          <div>
            <h3 className="text-4xl font-serif font-bold mb-2 text-white">Teacher Leaderboard</h3>
            <p className="text-white/50 text-lg font-light">Celebrating our most active and engaged educators across Michigan.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-paper/50 border-b border-chalkboard/5">
              <th className="px-12 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Rank</th>
              <th className="px-12 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Educator</th>
              <th className="px-12 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Initiatives</th>
              <th className="px-12 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Engagement</th>
              <th className="px-12 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Total Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chalkboard/5">
            {leaderboard.map((entry: any, index: number) => (
              <motion.tr
                key={`${entry.teacher_name}-${entry.school_name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-paper/30 transition-colors group"
              >
                <td className="px-12 py-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-xl shadow-sm",
                    index === 0 ? "bg-pencil text-chalkboard scale-110" : 
                    index === 1 ? "bg-slate-100 text-chalkboard" :
                    index === 2 ? "bg-orange-50 text-chalkboard" : "bg-chalkboard/5 text-chalkboard/40"
                  )}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-12 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-apple/5 flex items-center justify-center text-apple">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xl text-chalkboard group-hover:text-apple transition-colors">{entry.teacher_name}</div>
                      <div className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <School size={12} className="text-apple" />
                        {entry.school_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-12 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ruler/5 text-ruler flex items-center justify-center">
                      <Star size={18} />
                    </div>
                    <span className="font-mono font-bold text-lg">{entry.project_count}</span>
                  </div>
                </td>
                <td className="px-12 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-apple/5 text-apple flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <span className="font-mono font-bold text-lg">{entry.total_votes} <span className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest ml-1">Votes</span></span>
                  </div>
                </td>
                <td className="px-12 py-8">
                  <div className="font-serif font-bold text-2xl text-apple">
                    ${entry.total_raised.toLocaleString()}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {leaderboard.length === 0 && (
        <div className="p-24 text-center">
          <div className="w-20 h-20 bg-chalkboard/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-chalkboard/20" />
          </div>
          <p className="text-muted font-serif italic text-xl">No data available yet. Start a project to join the leaderboard!</p>
        </div>
      )}
    </div>
  );
}
