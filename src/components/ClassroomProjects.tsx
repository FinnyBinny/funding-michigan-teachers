import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, Heart, School, Loader2, CheckCircle2, Send, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProjects, readLS, saveLS, STORAGE_KEYS } from '../hooks/useLocalData';
import { PROJECTS } from '../data/initialData';
import { supabase, getVoterId } from '../lib/supabase';

const SUBMIT_PROJECT_ID = 2;
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

const INPUT_CLS = 'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-apple/20 outline-none transition-all placeholder:text-chalkboard/30';
const LABEL_CLS = 'block text-[10px] uppercase tracking-[0.15em] font-bold text-chalkboard/40 mb-1.5';

interface ClassroomProjectsProps {
  onDonate?: (amount?: number) => void;
}

export default function ClassroomProjects({ onDonate }: ClassroomProjectsProps) {
  const projects = useProjects();

  // ── Vote state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  // votedProjects: list of project IDs the current visitor has already voted for
  const [votedProjects, setVotedProjects] = useState<number[]>([]);
  // voteCounts: real-time counts from Supabase (falls back to project.votes from localStorage)
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [supabaseReady, setSupabaseReady] = useState(!supabase); // true immediately when no supabase

  // Load votes from Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    const voterId = getVoterId();

    (async () => {
      const { data } = await supabase.from('project_votes').select('project_id, voter_id');
      if (data) {
        const counts: Record<number, number> = {};
        const mine: number[] = [];
        for (const row of data) {
          counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
          if (row.voter_id === voterId) mine.push(row.project_id);
        }
        setVoteCounts(counts);
        setVotedProjects(mine);
      }
      setSupabaseReady(true);
    })();
  }, []);

  // localStorage fallback: load voted projects when Supabase is not configured
  useEffect(() => {
    if (supabase) return;
    try {
      const saved = localStorage.getItem('mi_teacher_fund_votes');
      if (saved) setVotedProjects(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const handleVote = async (id: number) => {
    if (votedProjects.includes(id)) {
      alert('You have already voted for this project!');
      return;
    }
    setLoading(id);

    if (supabase) {
      // ── Supabase path ──────────────────────────────────────────────────
      const voterId = getVoterId();
      const { error } = await supabase
        .from('project_votes')
        .insert({ project_id: id, voter_id: voterId });

      if (!error) {
        setVoteCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
        setVotedProjects(prev => [...prev, id]);
        setSuccess(id);
      }
      setLoading(null);
    } else {
      // ── localStorage fallback ──────────────────────────────────────────
      setTimeout(() => {
        const current = readLS(STORAGE_KEYS.projects, PROJECTS);
        const updated = current.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p);
        saveLS(STORAGE_KEYS.projects, updated);
        const newVoted = [...votedProjects, id];
        setVotedProjects(newVoted);
        localStorage.setItem('mi_teacher_fund_votes', JSON.stringify(newVoted));
        setSuccess(id);
        setLoading(null);
        setTimeout(() => setSuccess(null), 2000);
      }, 500);
    }

    if (success !== id) setTimeout(() => setSuccess(null), 2000);
  };

  // ── Project submission form ───────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacherName: '', schoolName: '', projectTitle: '', description: '', email: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    let submitted = false;

    // Try Supabase first
    if (supabase) {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.teacherName,
        email: form.email,
        type: 'project',
        extra: { schoolName: form.schoolName, projectTitle: form.projectTitle, description: form.description },
      });
      if (!error) submitted = true;
    }

    // Fallback: try Web3Forms
    if (!submitted && WEB3FORMS_KEY) {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `New Project Submission — ${form.projectTitle} (${form.schoolName})`,
            'Teacher Name': form.teacherName,
            'School Name': form.schoolName,
            'Project Title': form.projectTitle,
            Description: form.description,
            email: form.email,
            replyto: form.email,
            from_name: form.teacherName,
          }),
        });
        const data = await res.json();
        if (data.success) submitted = true;
      } catch { /* ignore */ }
    }

    if (submitted) {
      setFormStatus('success');
      setTimeout(() => {
        setShowForm(false);
        setFormStatus('idle');
        setForm({ teacherName: '', schoolName: '', projectTitle: '', description: '', email: '' });
      }, 3000);
    } else {
      setFormStatus('error');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getVoteCount = (project: (typeof projects)[number]) =>
    voteCounts[project.id] !== undefined ? voteCounts[project.id] : project.votes;

  return (
    <>
      <div className="grid md:grid-cols-2 gap-10">
        {projects.map((project, index) => {
          const isSubmitCard = project.id === SUBMIT_PROJECT_ID;
          const voteCount = getVoteCount(project);
          const hasVoted = votedProjects.includes(project.id);

          return (
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
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border",
                    isSubmitCard
                      ? "bg-ruler/10 text-ruler border-ruler/20"
                      : "bg-pencil/20 text-ink border-pencil/30"
                  )}>
                    {isSubmitCard ? 'Open Call' : 'Project Fund'}
                  </div>
                </div>

                <h3 className="text-3xl font-serif font-bold mb-5 leading-tight group-hover:text-apple transition-colors">{project.title}</h3>
                <p className="text-chalkboard/60 text-lg mb-10 leading-relaxed font-light">
                  {project.description}
                </p>

                {!isSubmitCard && (
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
                )}
              </div>

              {/* Card footer */}
              <div className="mt-auto bg-chalkboard/[0.02] p-8 flex gap-5 relative border-t border-chalkboard/5">
                {isSubmitCard ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-ruler text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-ruler/90 transition-all active:scale-95 shadow-xl hover:scale-[1.02]"
                  >
                    <Send size={20} />
                    <span>Submit Your Project</span>
                  </button>
                ) : (
                  <>
                    <AnimatePresence>
                      {success === project.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute inset-0 bg-apple text-white flex items-center justify-center gap-3 z-10 font-bold text-lg"
                        >
                          <CheckCircle2 size={24} />
                          <span>Vote Counted! Thank you!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => handleVote(project.id)}
                      disabled={loading === project.id || hasVoted || !supabaseReady}
                      className={cn(
                        "flex-1 border-2 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-sm",
                        hasVoted
                          ? "bg-apple/10 border-apple text-apple cursor-default"
                          : "bg-white border-chalkboard/10 text-chalkboard hover:bg-chalkboard hover:text-white hover:border-chalkboard"
                      )}
                    >
                      {loading === project.id ? <Loader2 className="animate-spin" size={20} /> : <ThumbsUp size={20} />}
                      <span>{hasVoted ? 'Voted' : `Vote (${voteCount})`}</span>
                    </button>
                    <button
                      onClick={() => onDonate?.()}
                      className="flex-1 bg-apple text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-apple/90 transition-all active:scale-95 shadow-xl hover:scale-[1.02] cursor-pointer"
                    >
                      <Heart size={20} />
                      <span>Donate</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submit Project Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-chalkboard p-8 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold leading-none">Submit Your Project</h2>
                  <p className="text-white/50 text-sm mt-2">Tell us what your classroom needs — we'll work to make it happen.</p>
                </div>
                <button onClick={() => setShowForm(false)} aria-label="Close form" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Your Name</label>
                    <input required value={form.teacherName} onChange={e => setForm({ ...form, teacherName: e.target.value })} className={INPUT_CLS} placeholder="Ms. Johnson" />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>School Name</label>
                    <input required value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} className={INPUT_CLS} placeholder="Okemos High School" />
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Project Title</label>
                  <input required value={form.projectTitle} onChange={e => setForm({ ...form, projectTitle: e.target.value })} className={INPUT_CLS} placeholder="e.g. New Lab Equipment" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Describe Your Need</label>
                  <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(INPUT_CLS, 'resize-none')} placeholder="What do your students need, and why does it matter?" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Your Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_CLS} placeholder="teacher@school.edu" />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'loading' || formStatus === 'success'}
                  className="w-full bg-apple text-white py-4 rounded-2xl font-bold text-sm hover:bg-apple/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl"
                >
                  {formStatus === 'loading' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : formStatus === 'success' ? (
                    <><CheckCircle2 size={18} /><span>Submitted!</span></>
                  ) : (
                    <><Send size={18} /><span>Submit Project</span></>
                  )}
                </button>

                {formStatus === 'success' && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center text-apple font-bold text-sm">
                    We received your submission — we'll be in touch soon!
                  </motion.p>
                )}
                {formStatus === 'error' && (
                  <p className="text-center text-red-500 font-bold text-sm">
                    Something went wrong. Please email us at{' '}
                    <a href="mailto:edu@fundingmichiganteachers.org" className="underline">edu@fundingmichiganteachers.org</a>
                  </p>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
