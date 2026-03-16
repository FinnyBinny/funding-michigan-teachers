import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, Heart, School, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProjects } from '../hooks/useLocalData';

export default function ClassroomProjects() {
  const baseProjects = useProjects();
  const [voteIncrements, setVoteIncrements] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState<{id: number, type: 'vote' | 'donate'} | null>(null);
  const [alreadyVotedId, setAlreadyVotedId] = useState<number | null>(null);
  const [votedProjects, setVotedProjects] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('mi_teacher_fund_votes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Apply local vote increments on top of base project data
  const projects = baseProjects.map(p => ({
    ...p,
    votes: p.votes + (voteIncrements[p.id] || 0),
  }));

  const handleVote = (id: number) => {
    if (votedProjects.includes(id)) {
      setAlreadyVotedId(id);
      setTimeout(() => setAlreadyVotedId(null), 2000);
      return;
    }
    setLoading(id);
    setTimeout(() => {
      const newVotes = [...votedProjects, id];
      setVotedProjects(newVotes);
      localStorage.setItem('mi_teacher_fund_votes', JSON.stringify(newVotes));
      setVoteIncrements(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setSuccess({ id, type: 'vote' });
      setLoading(null);
      setTimeout(() => setSuccess(null), 2000);
    }, 500);
  };

  const handleDonate = () => {
    window.open('https://givebutter.com/fundingmichiganteachers', '_blank');
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 overflow-hidden flex flex-col hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group"
        >
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-apple/10 text-apple rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                  <School size={28} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg leading-none">{project.school_name}</h4>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1.5">{project.teacher_name}</p>
                </div>
              </div>
              <div className="bg-pencil/20 text-ink px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-pencil/30">
                Project Fund
              </div>
            </div>

            <h3 className="text-3xl font-serif font-bold mb-5 leading-tight group-hover:text-apple transition-colors">{project.title}</h3>
            <p className="text-chalkboard/60 text-lg mb-10 leading-relaxed font-light">
              {project.description}
            </p>

            <div className="space-y-5">
              <div className="flex justify-between items-end text-sm font-bold">
                <div className="text-muted uppercase tracking-widest text-[10px]">Funding Progress</div>
                <div className="text-apple font-mono text-lg">${project.raised.toLocaleString()} <span className="text-muted font-light text-sm">/ ${project.goal.toLocaleString()}</span></div>
              </div>
              <div className="h-4 bg-chalkboard/5 rounded-full overflow-hidden p-1 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-apple rounded-full shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-chalkboard/[0.02] p-8 flex gap-5 relative border-t border-chalkboard/5">
            <AnimatePresence>
              {success?.id === project.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 bg-apple text-white flex items-center justify-center gap-3 z-10 font-bold text-lg rounded-b-[40px]"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 size={24} />
                  <span>Vote Counted! Thank you!</span>
                </motion.div>
              )}
              {alreadyVotedId === project.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 bg-chalkboard text-white flex items-center justify-center gap-3 z-10 font-bold text-lg rounded-b-[40px]"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 size={24} />
                  <span>You've already voted for this project!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => handleVote(project.id)}
              disabled={loading === project.id || votedProjects.includes(project.id)}
              className={cn(
                "flex-1 border-2 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-sm",
                votedProjects.includes(project.id)
                  ? "bg-apple/10 border-apple text-apple cursor-default"
                  : "bg-white border-chalkboard/10 text-chalkboard hover:bg-chalkboard hover:text-white hover:border-chalkboard"
              )}
            >
              {loading === project.id ? <Loader2 className="animate-spin" size={20} /> : <ThumbsUp size={20} />}
              <span>{votedProjects.includes(project.id) ? 'Voted' : `Vote (${project.votes})`}</span>
            </button>
            <button
              onClick={handleDonate}
              className="flex-1 bg-apple text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-apple/90 transition-all active:scale-95 shadow-xl hover:scale-[1.02]"
            >
              <Heart size={20} />
              <span>Donate</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
