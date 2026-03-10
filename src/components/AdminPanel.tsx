import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Save, Trash2, X, Layout, Users, Calendar, BookOpen, Loader2, MapPin, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminPanel({ onRefresh }: { onRefresh?: () => void }) {
  const [activeTab, setActiveTab] = useState<'stories' | 'events' | 'projects' | 'donors' | 'locations'>('stories');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [storyForm, setStoryForm] = useState({
    name: '', bio: '', impact: '', school: '', location: '', image: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '', date: '', description: '', location: '', type: 'fundraiser'
  });

  const [projectForm, setProjectForm] = useState({
    teacher_name: '', school_name: '', title: '', description: '', goal: 0
  });

  const [donorForm, setDonorForm] = useState({
    name: '', amount: 0, tier: 'Pencil Pal', message: ''
  });

  const [locationForm, setLocationForm] = useState({
    name: '', district: '', impact: '', amount: '', lat: 42.3314, lng: -83.0458, students: '', low_income: '', diversity: '', projects: ''
  });

  useEffect(() => {
    fetchItems();
    setEditingId(null);
    resetForms();
  }, [activeTab]);

  const resetForms = () => {
    setStoryForm({ name: '', bio: '', impact: '', school: '', location: '', image: '' });
    setEventForm({ title: '', date: '', description: '', location: '', type: 'fundraiser' });
    setProjectForm({ teacher_name: '', school_name: '', title: '', description: '', goal: 0 });
    setDonorForm({ name: '', amount: 0, tier: 'Pencil Pal', message: '' });
    setLocationForm({ name: '', district: '', impact: '', amount: '', lat: 42.3314, lng: -83.0458, students: '', low_income: '', diversity: '', projects: '' });
  };

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch(`/api/${activeTab}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'stories') {
      setStoryForm({
        name: item.name,
        bio: item.bio,
        impact: item.impact,
        school: item.school,
        location: item.location,
        image: item.image || ''
      });
    } else if (activeTab === 'events') {
      setEventForm({
        title: item.title,
        date: item.date,
        description: item.description,
        location: item.location,
        type: item.type
      });
    } else if (activeTab === 'projects') {
      setProjectForm({
        teacher_name: item.teacher_name,
        school_name: item.school_name,
        title: item.title,
        description: item.description,
        goal: item.goal
      });
    } else if (activeTab === 'donors') {
      setDonorForm({
        name: item.name,
        amount: item.amount,
        tier: item.tier,
        message: item.message || ''
      });
    } else if (activeTab === 'locations') {
      setLocationForm({
        name: item.name,
        district: item.district,
        impact: item.impact,
        amount: item.amount,
        lat: item.lat,
        lng: item.lng,
        students: item.students || '',
        low_income: item.low_income || '',
        diversity: item.diversity || '',
        projects: item.projects || ''
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/${activeTab}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
        onRefresh?.();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/stories/${editingId}` : '/api/stories';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyForm)
    });
    if (res.ok) {
      resetForms();
      setEditingId(null);
      fetchItems();
      onRefresh?.();
      alert(`Story ${editingId ? 'updated' : 'added'} successfully!`);
    }
    setIsSubmitting(false);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/events/${editingId}` : '/api/events';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm)
    });
    if (res.ok) {
      resetForms();
      setEditingId(null);
      fetchItems();
      onRefresh?.();
      alert(`Event ${editingId ? 'updated' : 'added'} successfully!`);
    }
    setIsSubmitting(false);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/projects/${editingId}` : '/api/projects';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm)
    });
    if (res.ok) {
      resetForms();
      setEditingId(null);
      fetchItems();
      onRefresh?.();
      alert(`Project ${editingId ? 'updated' : 'added'} successfully!`);
    }
    setIsSubmitting(false);
  };

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/donors/${editingId}` : '/api/donors';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donorForm)
    });
    if (res.ok) {
      resetForms();
      setEditingId(null);
      fetchItems();
      onRefresh?.();
      alert(`Donor ${editingId ? 'updated' : 'added'} successfully!`);
    }
    setIsSubmitting(false);
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/locations/${editingId}` : '/api/locations';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationForm)
    });
    if (res.ok) {
      resetForms();
      setEditingId(null);
      fetchItems();
      onRefresh?.();
      alert(`Location ${editingId ? 'updated' : 'added'} successfully!`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-chalkboard/5 overflow-hidden">
      <div className="bg-chalkboard p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Layout className="text-pencil" size={24} />
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        </div>
        <p className="text-white/50 text-sm">Manage your teacher stories, events, and classroom projects.</p>
      </div>

      <div className="flex border-b border-chalkboard/5">
        {[
          { id: 'stories', label: 'Teacher Stories', icon: Users },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'projects', label: 'Projects', icon: BookOpen },
          { id: 'donors', label: 'Supporters', icon: Heart },
          { id: 'locations', label: 'Impact Map', icon: MapPin },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all",
              activeTab === tab.id ? "bg-paper text-apple" : "text-chalkboard/40 hover:text-chalkboard"
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 divide-x divide-chalkboard/5">
        <div className="p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            {editingId ? <Save size={20} className="text-apple" /> : <Plus size={20} className="text-apple" />}
            {editingId ? 'Edit' : 'Add New'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
          </h3>
          
          {activeTab === 'stories' && (
            <form onSubmit={handleStorySubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Teacher Name</label>
                  <input 
                    required
                    value={storyForm.name}
                    onChange={e => setStoryForm({...storyForm, name: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Sarah Jenkins"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">School</label>
                  <input 
                    required
                    value={storyForm.school}
                    onChange={e => setStoryForm({...storyForm, school: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Cass Technical High"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Location</label>
                <input 
                  required
                  value={storyForm.location}
                  onChange={e => setStoryForm({...storyForm, location: e.target.value})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="Detroit, MI"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Bio</label>
                <textarea 
                  required
                  value={storyForm.bio}
                  onChange={e => setStoryForm({...storyForm, bio: e.target.value})}
                  rows={2}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="Brief teacher biography..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Impact Story</label>
                <textarea 
                  required
                  value={storyForm.impact}
                  onChange={e => setStoryForm({...storyForm, impact: e.target.value})}
                  rows={3}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="How did the funding help?"
                />
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); resetForms(); }}
                    className="flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-chalkboard/20 transition-all"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-apple text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                  <span>{editingId ? 'Update' : 'Add'} Story</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'events' && (
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Event Title</label>
                  <input 
                    required
                    value={eventForm.title}
                    onChange={e => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Summer Showcase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Date</label>
                  <input 
                    required
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Location</label>
                <input 
                  required
                  value={eventForm.location}
                  onChange={e => setEventForm({...eventForm, location: e.target.value})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="Ann Arbor, MI"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Description</label>
                <textarea 
                  required
                  value={eventForm.description}
                  onChange={e => setEventForm({...eventForm, description: e.target.value})}
                  rows={2}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="Event details..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Type</label>
                <select 
                  value={eventForm.type}
                  onChange={e => setEventForm({...eventForm, type: e.target.value})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none"
                >
                  <option value="fundraiser">Fundraiser</option>
                  <option value="appreciation">Appreciation</option>
                  <option value="showcase">Showcase</option>
                </select>
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); resetForms(); }}
                    className="flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-chalkboard/20 transition-all"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-ruler text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-ruler/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                  <span>{editingId ? 'Update' : 'Add'} Event</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'projects' && (
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Teacher Name</label>
                  <input 
                    required
                    value={projectForm.teacher_name}
                    onChange={e => setProjectForm({...projectForm, teacher_name: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Mr. Smith"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">School Name</label>
                  <input 
                    required
                    value={projectForm.school_name}
                    onChange={e => setProjectForm({...projectForm, school_name: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Detroit Central"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Project Title</label>
                <input 
                  required
                  value={projectForm.title}
                  onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="New Art Supplies"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Description</label>
                <textarea 
                  required
                  value={projectForm.description}
                  onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                  rows={2}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="What do you need funding for?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Funding Goal ($)</label>
                <input 
                  required
                  type="number"
                  value={projectForm.goal}
                  onChange={e => setProjectForm({...projectForm, goal: Number(e.target.value)})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="500"
                />
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); resetForms(); }}
                    className="flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-chalkboard/20 transition-all"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-apple text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                  <span>{editingId ? 'Update' : 'Add'} Project</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'donors' && (
            <form onSubmit={handleDonorSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Donor Name</label>
                  <input 
                    required
                    value={donorForm.name}
                    onChange={e => setDonorForm({...donorForm, name: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Amount ($)</label>
                  <input 
                    required
                    type="number"
                    value={donorForm.amount}
                    onChange={e => setDonorForm({...donorForm, amount: Number(e.target.value)})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Tier</label>
                <select 
                  value={donorForm.tier}
                  onChange={e => setDonorForm({...donorForm, tier: e.target.value})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none"
                >
                  <option value="Pencil Pal">Pencil Pal</option>
                  <option value="Ruler Rockstar">Ruler Rockstar</option>
                  <option value="Textbook Tycoon">Textbook Tycoon</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Message</label>
                <textarea 
                  value={donorForm.message}
                  onChange={e => setDonorForm({...donorForm, message: e.target.value})}
                  rows={2}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="Optional message..."
                />
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); resetForms(); }}
                    className="flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-chalkboard/20 transition-all"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-pencil text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pencil/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                  <span>{editingId ? 'Update' : 'Add'} Supporter</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'locations' && (
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">School Name</label>
                  <input 
                    required
                    value={locationForm.name}
                    onChange={e => setLocationForm({...locationForm, name: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Cass Technical High"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">District</label>
                  <input 
                    required
                    value={locationForm.district}
                    onChange={e => setLocationForm({...locationForm, district: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="Detroit Public Schools"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Latitude</label>
                  <input 
                    required
                    type="number"
                    step="0.0001"
                    value={locationForm.lat}
                    onChange={e => setLocationForm({...locationForm, lat: Number(e.target.value)})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Longitude</label>
                  <input 
                    required
                    type="number"
                    step="0.0001"
                    value={locationForm.lng}
                    onChange={e => setLocationForm({...locationForm, lng: Number(e.target.value)})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Impact Summary</label>
                <textarea 
                  required
                  value={locationForm.impact}
                  onChange={e => setLocationForm({...locationForm, impact: e.target.value})}
                  rows={2}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="What was the impact?"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Grant Amount</label>
                  <input 
                    required
                    value={locationForm.amount}
                    onChange={e => setLocationForm({...locationForm, amount: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="$25,000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Students Count</label>
                  <input 
                    value={locationForm.students}
                    onChange={e => setLocationForm({...locationForm, students: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="2,400"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Low Income %</label>
                  <input 
                    value={locationForm.low_income}
                    onChange={e => setLocationForm({...locationForm, low_income: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="85%"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Diversity %</label>
                  <input 
                    value={locationForm.diversity}
                    onChange={e => setLocationForm({...locationForm, diversity: e.target.value})}
                    className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                    placeholder="92%"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Funded Projects (comma separated)</label>
                <input 
                  value={locationForm.projects}
                  onChange={e => setLocationForm({...locationForm, projects: e.target.value})}
                  className="w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none" 
                  placeholder="Robotics Lab, Senior Engineering Kits"
                />
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); resetForms(); }}
                    className="flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-chalkboard/20 transition-all"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-apple text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                  <span>{editingId ? 'Update' : 'Add'} Location</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-8 bg-paper/30">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Layout size={20} className="text-chalkboard/40" />
            Existing {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingItems ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-apple" size={32} />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-chalkboard/30 italic text-sm">
                No items found.
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-chalkboard/5 shadow-sm flex justify-between items-center group hover:border-apple/20 transition-all"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.title || item.name}</h4>
                    <p className="text-[10px] text-chalkboard/40 truncate">
                      {item.school || item.school_name || item.date || `$${item.amount}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-chalkboard/20 hover:text-ruler hover:bg-ruler/5 rounded-lg transition-all"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-chalkboard/20 hover:text-apple hover:bg-apple/5 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
