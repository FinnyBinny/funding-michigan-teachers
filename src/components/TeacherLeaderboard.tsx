import { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Star, TrendingUp, School } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProjects } from '../hooks/useLocalData';
import { supabase } from '../lib/supabase';

export default function TeacherLeaderboard() {
  const projects = useProjects();
  const [supaVotes, setSupaVotes] = useState<Record<number, number>>({});

  // Fetch real vote counts from Supabase, and re-fetch whenever a vote is cast
  useEffect(() => {
    const fetchVotes = () => {
      if (!supabase) return;
      supabase.from('project_votes').select('project_id').then(({ data }) => {
        if (!data) return;
        const counts: Record<number, number> = {};
        for (const row of data) {
          counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
        }
        setSupaVotes(counts);
      });
    };
    fetchVotes();
    window.addEventListener('fmt-vote-changed', fetchVotes);
    return () => window.removeEventListener('fmt-vote-changed', fetchVotes);
  }, []);

  const leaderboard = useMemo(() => Object.values(
    projects
      .filter(p => p.teacher_name !== 'Submit a Project' && p.school_name !== 'Your Classroom')
      .reduce((acc, p) => {
        const key = `${p.teacher_name}|${p.school_name}`;
        if (!acc[key]) {
          acc[key] = { teacher_name: p.teacher_name, school_name: p.school_name, project_count: 0, total_votes: 0, total_raised: 0 };
        }
        acc[key].project_count += 1;
        // Use Supabase vote count if available, otherwise fall back to stored value
        acc[key].total_votes += supaVotes[p.id] !== undefined ? supaVotes[p.id] : Number(p.votes);
        acc[key].total_raised += Number(p.raised);
        return acc;
      }, {} as Record<string, { teacher_name: string; school_name: string; project_count: number; total_votes: number; total_raised: number }>)
  ).sort((a, b) => b.total_votes - a.total_votes), [projects, supaVotes]);

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-chalkboard/5 overflow-hidden">
      <div className="bg-chalkboard p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-apple/10 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-apple/20 text-apple rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-inner shrink-0">
            <Trophy size={32} className="text-pencil" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold mb-1 sm:mb-2 text-white">Teacher Leaderboard</h3>
            <p className="text-white/50 text-sm sm:text-lg font-light">Celebrating our most active and engaged educators across Michigan.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-paper/50 border-b border-chalkboard/5">
              <th className="px-6 sm:px-12 py-4 sm:py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Rank</th>
              <th className="px-6 sm:px-12 py-4 sm:py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Educator</th>
              <th className="px-6 sm:px-12 py-4 sm:py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Initiatives</th>
              <th className="px-6 sm:px-12 py-4 sm:py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Votes</th>
              <th className="px-6 sm:px-12 py-4 sm:py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Raised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chalkboard/5">
            {leaderboard.map((entry, index) => (
              <motion.tr
                key={`${entry.teacher_name}-${entry.school_name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-paper/30 transition-colors group"
              >
                <td className="px-6 sm:px-12 py-5 sm:py-8">
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-lg sm:text-xl shadow-sm",
                    index === 0 ? "bg-pencil text-chalkboard scale-110" :
                    index === 1 ? "bg-slate-100 text-chalkboard" :
                    index === 2 ? "bg-orange-50 text-chalkboard" : "bg-chalkboard/5 text-chalkboard/40"
                  )}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 sm:px-12 py-5 sm:py-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-apple/5 flex items-center justify-center text-apple shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base sm:text-xl text-chalkboard group-hover:text-apple transition-colors">{entry.teacher_name}</div>
                      <div className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1 sm:gap-2 mt-1">
                        <School size={11} className="text-apple" />
                        {entry.school_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 sm:px-12 py-5 sm:py-8">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-ruler/5 text-ruler flex items-center justify-center">
                      <Star size={16} />
                    </div>
                    <span className="font-mono font-bold">{entry.project_count}</span>
                  </div>
                </td>
                <td className="px-6 sm:px-12 py-5 sm:py-8">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-apple/5 text-apple flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                    <span className="font-mono font-bold">{entry.total_votes}</span>
                  </div>
                </td>
                <td className="px-6 sm:px-12 py-5 sm:py-8">
                  <div className="font-serif font-bold text-lg sm:text-2xl text-apple">
                    ${entry.total_raised.toLocaleString()}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="p-16 sm:p-24 text-center">
          <div className="w-20 h-20 bg-chalkboard/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-chalkboard/20" />
          </div>
          <p className="text-muted font-serif italic text-xl">No data yet. Start a project to join the leaderboard!</p>
        </div>
      )}
    </div>
  );
}
