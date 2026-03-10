import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Save, Trash2, X, Layout, Users, Calendar,
  BookOpen, MapPin, Heart, Lock, Download, Eye, EyeOff, Edit2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { readLS, saveLS, STORAGE_KEYS } from '../hooks/useLocalData';
import type { Event, Donor, Project, Story, Location } from '../data/initialData';

// ─── Change this password to something secret before deploying ───
const ADMIN_PASSWORD = 'FMT2025!';

// Shared Tailwind class strings
const inp = 'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none';
const lbl = 'block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1';
const btnSave = 'flex-[2] bg-apple text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple/90 transition-all';
const btnCancel = 'flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-chalkboard/20 transition-all';

type Tab = 'stories' | 'events' | 'projects' | 'donors' | 'locations';

function nextNumId(arr: any[]): number {
  return Math.max(0, ...arr.map(i => Number(i.id) || 0)) + 1;
}

export default function AdminPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);

  // Tab & list
  const [activeTab, setActiveTab] = useState<Tab>('stories');
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Form states (abbreviated names for readability)
  const [sf, setSf] = useState({ name: '', bio: '', impact: '', school: '', location: '', image: '' });
  const [ef, setEf] = useState({ title: '', date: '', description: '', location: '', type: 'fundraiser' });
  const [pf, setPf] = useState({ teacher_name: '', school_name: '', title: '', description: '', goal: 0 });
  const [df, setDf] = useState({ name: '', amount: 0, tier: 'Pencil Pal', message: '' });
  const [lf, setLf] = useState({ name: '', district: '', impact: '', amount: '', lat: 42.3314, lng: -83.0458, students: '', low_income: '', diversity: '', projects: '' });

  // Reset auth when modal closes
  useEffect(() => {
    if (!isOpen) { setAuthed(false); setPw(''); setPwError(false); }
  }, [isOpen]);

  // Load items when tab or auth changes
  useEffect(() => {
    if (authed) setItems(readLS(STORAGE_KEYS[activeTab], []));
    setEditingId(null);
    resetAll();
  }, [activeTab, authed]); // eslint-disable-line

  const resetAll = () => {
    setSf({ name: '', bio: '', impact: '', school: '', location: '', image: '' });
    setEf({ title: '', date: '', description: '', location: '', type: 'fundraiser' });
    setPf({ teacher_name: '', school_name: '', title: '', description: '', goal: 0 });
    setDf({ name: '', amount: 0, tier: 'Pencil Pal', message: '' });
    setLf({ name: '', district: '', impact: '', amount: '', lat: 42.3314, lng: -83.0458, students: '', low_income: '', diversity: '', projects: '' });
  };

  const commit = (key: string, updated: any[]) => {
    saveLS(key, updated);
    setItems(updated);
    resetAll();
    setEditingId(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  const loadForEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'stories')
      setSf({ name: item.name, bio: item.bio, impact: item.impact, school: item.school, location: item.location, image: item.image || '' });
    else if (activeTab === 'events')
      setEf({ title: item.title, date: item.date, description: item.description, location: item.location, type: item.type });
    else if (activeTab === 'projects')
      setPf({ teacher_name: item.teacher_name, school_name: item.school_name, title: item.title, description: item.description, goal: item.goal });
    else if (activeTab === 'donors')
      setDf({ name: item.name, amount: item.amount, tier: item.tier, message: item.message || '' });
    else if (activeTab === 'locations')
      setLf({ name: item.name, district: item.district, impact: item.impact, amount: item.amount, lat: item.lat, lng: item.lng, students: item.demographics?.students || '', low_income: item.demographics?.lowIncome || '', diversity: item.demographics?.diversity || '', projects: (item.projects || []).join(', ') });
  };

  const handleDelete = (id: any) => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    commit(STORAGE_KEYS[activeTab], items.filter(i => i.id !== id));
  };

  // Form submit handlers
  const onStory = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Story[] = editingId !== null
      ? items.map(i => i.id === editingId ? { ...i, ...sf } : i)
      : [...items, { id: nextNumId(items), ...sf }];
    commit(STORAGE_KEYS.stories, updated);
  };

  const onEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Event[] = editingId !== null
      ? items.map(i => i.id === editingId ? { ...i, ...ef } : i)
      : [...items, { id: nextNumId(items), ...ef }];
    commit(STORAGE_KEYS.events, updated);
  };

  const onProject = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Project[] = editingId !== null
      ? items.map(i => i.id === editingId ? { ...i, ...pf } : i)
      : [...items, { id: nextNumId(items), raised: 0, votes: 0, ...pf }];
    commit(STORAGE_KEYS.projects, updated);
  };

  const onDonor = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Donor[] = editingId !== null
      ? items.map(i => i.id === editingId ? { ...i, ...df } : i)
      : [...items, { id: nextNumId(items), pos_x: 0, pos_y: 0, ...df }];
    commit(STORAGE_KEYS.donors, updated);
  };

  const onLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const locData: Location = {
      id: editingId !== null ? String(editingId) : String(nextNumId(items)),
      name: lf.name, district: lf.district, impact: lf.impact, amount: lf.amount,
      lat: lf.lat, lng: lf.lng,
      demographics: { students: lf.students, lowIncome: lf.low_income, diversity: lf.diversity },
      projects: lf.projects.split(',').map(p => p.trim()).filter(Boolean),
    };
    const updated: Location[] = editingId !== null
      ? items.map(i => i.id === String(editingId) ? locData : i)
      : [...items, locData];
    commit(STORAGE_KEYS.locations, updated);
  };

  const handleExport = () => {
    const ts = `// Exported from Admin Panel — paste into src/data/initialData.ts (replace the matching constants)

export const EVENTS: Event[] = ${JSON.stringify(readLS(STORAGE_KEYS.events, []), null, 2)};

export const DONORS: Donor[] = ${JSON.stringify(readLS(STORAGE_KEYS.donors, []), null, 2)};

export const PROJECTS: Project[] = ${JSON.stringify(readLS(STORAGE_KEYS.projects, []), null, 2)};

export const STORIES: Story[] = ${JSON.stringify(readLS(STORAGE_KEYS.stories, []), null, 2)};

export const LOCATIONS: Location[] = ${JSON.stringify(readLS(STORAGE_KEYS.locations, []), null, 2)};
`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ts], { type: 'text/plain' }));
    a.download = 'fmt-data-export.ts';
    a.click();
  };

  const TABS = [
    { id: 'stories' as Tab, label: 'Stories', icon: Users },
    { id: 'events' as Tab, label: 'Events', icon: Calendar },
    { id: 'projects' as Tab, label: 'Projects', icon: BookOpen },
    { id: 'donors' as Tab, label: 'Supporters', icon: Heart },
    { id: 'locations' as Tab, label: 'Impact Map', icon: MapPin },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="bg-chalkboard p-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="text-pencil" size={24} />
              <div>
                <h2 className="text-2xl font-bold leading-none">Admin Dashboard</h2>
                <p className="text-white/50 text-xs mt-1">Manage stories, events, projects, and more.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {authed && (
                <button
                  onClick={handleExport}
                  className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  <Download size={14} /> Export Data
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ── Password Screen ── */}
          {!authed ? (
            <div className="p-16 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-apple/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock size={28} className="text-apple" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Admin Access</h3>
              <p className="text-chalkboard/50 mb-10 text-sm">Enter your password to manage site content.</p>
              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw}
                    onChange={e => { setPw(e.target.value); setPwError(false); }}
                    className={cn(inp, 'pr-12', pwError && 'ring-2 ring-red-400 border-red-300')}
                    placeholder="Password"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-chalkboard/30 hover:text-chalkboard transition-colors p-1">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {pwError && <p className="text-red-500 text-xs font-bold">Incorrect password. Try again.</p>}
                <button type="submit" className="w-full bg-apple text-white py-3 rounded-xl font-bold hover:bg-apple/90 transition-all">
                  Unlock Dashboard
                </button>
              </form>
            </div>

          ) : (
            <>
              {/* ── Tabs ── */}
              <div className="flex border-b border-chalkboard/5 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 min-w-[110px] py-4 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                      activeTab === tab.id ? 'text-apple border-b-2 border-apple bg-paper/60' : 'text-chalkboard/40 hover:text-chalkboard'
                    )}
                  >
                    <tab.icon size={15} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Form + List ── */}
              <div className="grid lg:grid-cols-2 divide-x divide-chalkboard/5">
                {/* Left: Form */}
                <div className="p-8">
                  <h3 className="text-base font-bold mb-5 flex items-center gap-2">
                    {editingId !== null ? <Save size={16} className="text-apple" /> : <Plus size={16} className="text-apple" />}
                    {editingId !== null ? 'Edit' : 'Add'} {activeTab === 'stories' ? 'Story' : activeTab === 'events' ? 'Event' : activeTab === 'projects' ? 'Project' : activeTab === 'donors' ? 'Supporter' : 'Location'}
                  </h3>

                  {/* STORIES */}
                  {activeTab === 'stories' && (
                    <form onSubmit={onStory} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Teacher Name</label><input required value={sf.name} onChange={e => setSf({ ...sf, name: e.target.value })} className={inp} placeholder="Sarah Jenkins" /></div>
                        <div><label className={lbl}>School</label><input required value={sf.school} onChange={e => setSf({ ...sf, school: e.target.value })} className={inp} placeholder="Cass Technical High" /></div>
                      </div>
                      <div><label className={lbl}>Location (City, MI)</label><input required value={sf.location} onChange={e => setSf({ ...sf, location: e.target.value })} className={inp} placeholder="Detroit, MI" /></div>
                      <div><label className={lbl}>Photo URL (optional)</label><input value={sf.image} onChange={e => setSf({ ...sf, image: e.target.value })} className={inp} placeholder="https://picsum.photos/seed/teacher/800/800" /></div>
                      <div><label className={lbl}>Bio</label><textarea required rows={2} value={sf.bio} onChange={e => setSf({ ...sf, bio: e.target.value })} className={inp} placeholder="Brief teacher biography..." /></div>
                      <div><label className={lbl}>Impact Story</label><textarea required rows={3} value={sf.impact} onChange={e => setSf({ ...sf, impact: e.target.value })} className={inp} placeholder="How did the funding help?" /></div>
                      <div className="flex gap-3 pt-1">
                        {editingId !== null && <button type="button" onClick={() => { setEditingId(null); resetAll(); }} className={btnCancel}><X size={15} />Cancel</button>}
                        <button type="submit" className={btnSave}>{editingId !== null ? <><Save size={15} />Update Story</> : <><Plus size={15} />Add Story</>}</button>
                      </div>
                    </form>
                  )}

                  {/* EVENTS */}
                  {activeTab === 'events' && (
                    <form onSubmit={onEvent} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Event Title</label><input required value={ef.title} onChange={e => setEf({ ...ef, title: e.target.value })} className={inp} placeholder="Spring Gala" /></div>
                        <div><label className={lbl}>Date</label><input required type="date" value={ef.date} onChange={e => setEf({ ...ef, date: e.target.value })} className={inp} /></div>
                      </div>
                      <div><label className={lbl}>Location</label><input required value={ef.location} onChange={e => setEf({ ...ef, location: e.target.value })} className={inp} placeholder="Okemos Conference Center, MI" /></div>
                      <div><label className={lbl}>Description</label><textarea required rows={2} value={ef.description} onChange={e => setEf({ ...ef, description: e.target.value })} className={inp} placeholder="Event details..." /></div>
                      <div><label className={lbl}>Type</label>
                        <select value={ef.type} onChange={e => setEf({ ...ef, type: e.target.value })} className={inp}>
                          <option value="fundraiser">Fundraiser</option>
                          <option value="appreciation">Appreciation</option>
                          <option value="showcase">Showcase</option>
                          <option value="workshop">Workshop</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-1">
                        {editingId !== null && <button type="button" onClick={() => { setEditingId(null); resetAll(); }} className={btnCancel}><X size={15} />Cancel</button>}
                        <button type="submit" className={btnSave}>{editingId !== null ? <><Save size={15} />Update Event</> : <><Plus size={15} />Add Event</>}</button>
                      </div>
                    </form>
                  )}

                  {/* PROJECTS */}
                  {activeTab === 'projects' && (
                    <form onSubmit={onProject} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Teacher Name</label><input required value={pf.teacher_name} onChange={e => setPf({ ...pf, teacher_name: e.target.value })} className={inp} placeholder="Mr. Smith" /></div>
                        <div><label className={lbl}>School Name</label><input required value={pf.school_name} onChange={e => setPf({ ...pf, school_name: e.target.value })} className={inp} placeholder="Detroit Central" /></div>
                      </div>
                      <div><label className={lbl}>Project Title</label><input required value={pf.title} onChange={e => setPf({ ...pf, title: e.target.value })} className={inp} placeholder="New Art Supplies" /></div>
                      <div><label className={lbl}>Description</label><textarea required rows={2} value={pf.description} onChange={e => setPf({ ...pf, description: e.target.value })} className={inp} placeholder="What do you need funding for?" /></div>
                      <div><label className={lbl}>Funding Goal ($)</label><input required type="number" min={1} value={pf.goal || ''} onChange={e => setPf({ ...pf, goal: Number(e.target.value) })} className={inp} placeholder="500" /></div>
                      <div className="flex gap-3 pt-1">
                        {editingId !== null && <button type="button" onClick={() => { setEditingId(null); resetAll(); }} className={btnCancel}><X size={15} />Cancel</button>}
                        <button type="submit" className={btnSave}>{editingId !== null ? <><Save size={15} />Update Project</> : <><Plus size={15} />Add Project</>}</button>
                      </div>
                    </form>
                  )}

                  {/* DONORS */}
                  {activeTab === 'donors' && (
                    <form onSubmit={onDonor} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Donor Name</label><input required value={df.name} onChange={e => setDf({ ...df, name: e.target.value })} className={inp} placeholder="Jane Doe" /></div>
                        <div><label className={lbl}>Amount ($)</label><input required type="number" min={1} value={df.amount || ''} onChange={e => setDf({ ...df, amount: Number(e.target.value) })} className={inp} placeholder="100" /></div>
                      </div>
                      <div><label className={lbl}>Donor Tier</label>
                        <select value={df.tier} onChange={e => setDf({ ...df, tier: e.target.value })} className={inp}>
                          <option value="Pencil Pal">Pencil Pal ($10/mo)</option>
                          <option value="Ruler Rockstar">Ruler Rockstar ($50/mo)</option>
                          <option value="Textbook Tycoon">Textbook Tycoon ($250/mo)</option>
                        </select>
                      </div>
                      <div><label className={lbl}>Message (optional)</label><textarea rows={2} value={df.message} onChange={e => setDf({ ...df, message: e.target.value })} className={inp} placeholder="Supporter message..." /></div>
                      <div className="flex gap-3 pt-1">
                        {editingId !== null && <button type="button" onClick={() => { setEditingId(null); resetAll(); }} className={btnCancel}><X size={15} />Cancel</button>}
                        <button type="submit" className={cn(btnSave, 'bg-ruler hover:bg-ruler/90')}>{editingId !== null ? <><Save size={15} />Update Supporter</> : <><Plus size={15} />Add Supporter</>}</button>
                      </div>
                    </form>
                  )}

                  {/* LOCATIONS */}
                  {activeTab === 'locations' && (
                    <form onSubmit={onLocation} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>School Name</label><input required value={lf.name} onChange={e => setLf({ ...lf, name: e.target.value })} className={inp} placeholder="Cass Technical High" /></div>
                        <div><label className={lbl}>District</label><input required value={lf.district} onChange={e => setLf({ ...lf, district: e.target.value })} className={inp} placeholder="Detroit Public Schools" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Latitude</label><input required type="number" step="0.0001" value={lf.lat} onChange={e => setLf({ ...lf, lat: Number(e.target.value) })} className={inp} /></div>
                        <div><label className={lbl}>Longitude</label><input required type="number" step="0.0001" value={lf.lng} onChange={e => setLf({ ...lf, lng: Number(e.target.value) })} className={inp} /></div>
                      </div>
                      <div><label className={lbl}>Impact Summary</label><textarea required rows={2} value={lf.impact} onChange={e => setLf({ ...lf, impact: e.target.value })} className={inp} placeholder="What was the impact?" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Grant Amount</label><input required value={lf.amount} onChange={e => setLf({ ...lf, amount: e.target.value })} className={inp} placeholder="$1,200" /></div>
                        <div><label className={lbl}>Students</label><input value={lf.students} onChange={e => setLf({ ...lf, students: e.target.value })} className={inp} placeholder="2,400" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Low Income %</label><input value={lf.low_income} onChange={e => setLf({ ...lf, low_income: e.target.value })} className={inp} placeholder="85%" /></div>
                        <div><label className={lbl}>Diversity %</label><input value={lf.diversity} onChange={e => setLf({ ...lf, diversity: e.target.value })} className={inp} placeholder="92%" /></div>
                      </div>
                      <div><label className={lbl}>Funded Projects (comma-separated)</label><input value={lf.projects} onChange={e => setLf({ ...lf, projects: e.target.value })} className={inp} placeholder="Robotics Lab, STEM Kits, Art Supplies" /></div>
                      <div className="flex gap-3 pt-1">
                        {editingId !== null && <button type="button" onClick={() => { setEditingId(null); resetAll(); }} className={btnCancel}><X size={15} />Cancel</button>}
                        <button type="submit" className={btnSave}>{editingId !== null ? <><Save size={15} />Update Location</> : <><Plus size={15} />Add Location</>}</button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right: Item List */}
                <div className="p-8 bg-paper/30">
                  <h3 className="text-base font-bold mb-5 flex items-center gap-2">
                    <Layout size={16} className="text-chalkboard/40" />
                    Existing {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    <span className="ml-auto text-[10px] font-bold text-chalkboard/30 bg-chalkboard/5 px-2 py-0.5 rounded-full">{items.length}</span>
                  </h3>
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {items.length === 0 ? (
                      <p className="text-center py-12 text-chalkboard/30 italic text-sm">No items yet. Add one on the left.</p>
                    ) : (
                      items.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-chalkboard/5 flex items-center justify-between gap-2 hover:border-apple/20 transition-all group">
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{item.title || item.name}</p>
                            <p className="text-[10px] text-chalkboard/40 truncate mt-0.5">
                              {item.school || item.school_name || item.district || item.date || (item.amount !== undefined ? `$${item.amount}` : '')}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => loadForEdit(item)} title="Edit" className="p-2 text-chalkboard/20 hover:text-ruler hover:bg-ruler/5 rounded-lg transition-all">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} title="Delete" className="p-2 text-chalkboard/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── Export Banner ── */}
              <div className="px-8 py-5 bg-chalkboard/5 border-t border-chalkboard/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">Make changes permanent for all visitors</p>
                  <p className="text-xs text-chalkboard/50 mt-0.5">
                    Export your data and paste the constants into{' '}
                    <code className="bg-chalkboard/10 px-1 rounded text-[10px] font-mono">src/data/initialData.ts</code>,
                    then push to GitHub to redeploy.
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="shrink-0 flex items-center gap-2 bg-chalkboard text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-apple transition-all"
                >
                  <Download size={14} /> Export .ts file
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
