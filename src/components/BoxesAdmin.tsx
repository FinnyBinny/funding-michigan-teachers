import { useEffect, useState } from 'react';
import { Check, Copy, Edit2, Loader2, Plus, RotateCcw, Truck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ORIGIN } from '../../shared/pageMeta';

/**
 * Admin dashboard → Boxes. The returnables collection boxes and their NFC /
 * QR links (SUPABASE_BOXES.sql sets up the tables).
 *
 * Red = a teacher tapped "Request a pickup". Empty the box, then press
 * "Mark picked up" and it goes back to green and counts as a pickup.
 *
 * Each box's link is what gets written to its NFC tag and turned into its QR
 * code. A box with no school yet asks the teacher for one on its first tap,
 * or fill it in here with Edit.
 */

interface BoxRow {
  id: number;
  box_number: number;
  code: string;
  school: string | null;
  room: string | null;
  teacher: string | null;
  status: 'ok' | 'full';
  requested_at: string | null;
}

const SCHOOLS = ['Okemos High School', 'East Lansing High School', 'Haslett High School'];
const inp = 'w-full bg-paper border border-chalkboard/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none';
const linkFor = (code: string) => `${ORIGIN}/box/${code}`;
// "214" reads as Room 214; "Main office" stays as typed.
const roomLabel = (room: string) => (/^\d/.test(room) ? `Room ${room}` : room);

function ago(iso: string | null): string {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function BoxesAdmin() {
  const [boxes, setBoxes] = useState<BoxRow[] | null>(null);
  const [pickups, setPickups] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ school: '', room: '', teacher: '' });

  const load = async () => {
    if (!supabase) { setError('Supabase is not configured.'); setBoxes([]); return; }
    const [b, e] = await Promise.all([
      supabase.from('returnable_boxes').select('id, box_number, code, school, room, teacher, status, requested_at').order('box_number'),
      supabase.from('box_events').select('box_id').eq('kind', 'picked_up'),
    ]);
    if (b.error) {
      setError(`Couldn't load boxes: ${b.error.message}. Has SUPABASE_BOXES.sql been run?`);
      setBoxes([]);
      return;
    }
    const counts: Record<number, number> = {};
    for (const row of (e.data ?? []) as { box_id: number }[]) counts[row.box_id] = (counts[row.box_id] ?? 0) + 1;
    setPickups(counts);
    setBoxes(b.data as BoxRow[]);
    setError(null);
  };

  useEffect(() => { void load(); }, []);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
    } catch {
      window.prompt('Copy this:', text);
    }
  };

  const run = async (id: number, op: () => PromiseLike<{ error: { message: string } | null }>) => {
    setBusyId(id);
    const { error: err } = await op();
    setBusyId(null);
    if (err) setError(err.message);
    await load();
  };

  const markPickedUp = (b: BoxRow) => run(b.id, () => supabase!.rpc('box_mark_picked_up', { p_box_id: b.id }));

  const saveEdit = (b: BoxRow) => {
    const clean = (s: string) => s.trim() || null;
    setEditing(null);
    return run(b.id, () => supabase!.from('returnable_boxes').update({
      school: clean(form.school), room: clean(form.room), teacher: clean(form.teacher),
    }).eq('id', b.id));
  };

  const clearBox = (b: BoxRow) => {
    if (!window.confirm(`Clear box #${b.box_number}'s school, room and teacher? Its next tap will ask for them again. Its link stays the same.`)) return;
    return run(b.id, () => supabase!.from('returnable_boxes').update({
      school: null, room: null, teacher: null, status: 'ok', requested_at: null,
    }).eq('id', b.id));
  };

  const addBox = () => {
    const next = Math.max(0, ...(boxes ?? []).map((b) => b.box_number)) + 1;
    return run(-1, () => supabase!.from('returnable_boxes').insert({ box_number: next }));
  };

  if (!boxes) {
    return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-chalkboard/50" aria-label="Loading boxes" /></div>;
  }

  const full = boxes.filter((b) => b.status === 'full');
  const totalPickups = Object.values(pickups).reduce((a, n) => a + n, 0);
  // Boxes waiting for a pickup first, oldest request first; then the rest by number.
  const sorted = [...boxes].sort((a, b) =>
    a.status !== b.status ? (a.status === 'full' ? -1 : 1)
      : a.status === 'full' ? (a.requested_at ?? '').localeCompare(b.requested_at ?? '')
      : a.box_number - b.box_number);
  const allLinks = boxes.map((b) => `Box ${b.box_number}${b.room ? ` (${roomLabel(b.room)}${b.school ? `, ${b.school}` : ''})` : ''}: ${linkFor(b.code)}`).join('\n');

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${full.length ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${full.length ? 'bg-red-500' : 'bg-emerald-500'}`} />
          {full.length ? `${full.length} box${full.length === 1 ? '' : 'es'} need${full.length === 1 ? 's' : ''} a pickup` : 'All boxes green'}
        </span>
        <span className="text-sm text-chalkboard/70">{boxes.length} boxes · {totalPickups} pickup{totalPickups === 1 ? '' : 's'} so far</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => copy(allLinks, 'all')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-chalkboard/5 hover:bg-chalkboard/10 text-sm font-bold">
            {copied === 'all' ? <Check size={14} /> : <Copy size={14} />} Copy all links
          </button>
          <button onClick={addBox} disabled={busyId === -1} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-apple text-white text-sm font-bold disabled:opacity-60">
            <Plus size={14} /> Add a box
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <ul className="space-y-2">
        {sorted.map((b) => {
          const isFull = b.status === 'full';
          const busy = busyId === b.id;
          return (
            <li key={b.id} className={`bg-white rounded-xl border p-4 ${isFull ? 'border-red-200 ring-1 ring-red-100' : 'border-chalkboard/5'}`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} aria-label={isFull ? 'Needs a pickup' : 'OK'} role="img" />
                <span className="font-bold w-16 shrink-0">Box #{b.box_number}</span>
                <div className="min-w-0 basis-full order-1 sm:order-none sm:basis-0 sm:flex-1">
                  {b.school ? (
                    <>
                      <p className="font-bold text-sm truncate">{b.room ? roomLabel(b.room) : 'No room'}{b.teacher ? ` · ${b.teacher}` : ''}</p>
                      <p className="text-xs text-chalkboard/70 truncate">{b.school}</p>
                    </>
                  ) : (
                    <p className="text-sm text-chalkboard/70 italic">Not set up yet: the first tap will ask for a school and room</p>
                  )}
                </div>
                <div className="text-xs text-chalkboard/70 sm:text-right shrink-0 order-2 sm:order-none mr-auto sm:mr-0">
                  {isFull && <p className="font-bold text-red-700">Requested {ago(b.requested_at)}</p>}
                  <p>{pickups[b.id] ?? 0} pickup{(pickups[b.id] ?? 0) === 1 ? '' : 's'}</p>
                </div>
                <div className="flex gap-1.5 shrink-0 order-2 sm:order-none">
                  {isFull && (
                    <button onClick={() => markPickedUp(b)} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-60">
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />} Mark picked up
                    </button>
                  )}
                  <button
                    onClick={() => { setEditing(editing === b.id ? null : b.id); setForm({ school: b.school ?? '', room: b.room ?? '', teacher: b.teacher ?? '' }); }}
                    aria-label={`Edit box ${b.box_number}`}
                    className="p-2 text-chalkboard/70 hover:bg-chalkboard/5 rounded-lg"
                  >
                    <Edit2 size={14} />
                  </button>
                  {b.school && (
                    <button onClick={() => clearBox(b)} aria-label={`Clear box ${b.box_number}`} className="p-2 text-chalkboard/70 hover:bg-chalkboard/5 rounded-lg">
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 bg-paper/70 rounded-lg px-3 py-1.5">
                <code className="text-xs truncate flex-1 select-all">{linkFor(b.code)}</code>
                <button onClick={() => copy(linkFor(b.code), b.code)} className="inline-flex items-center gap-1 text-xs font-bold text-chalkboard/80 hover:text-apple px-2 py-1">
                  {copied === b.code ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy link</>}
                </button>
              </div>

              {editing === b.id && (
                <form onSubmit={(e) => { e.preventDefault(); void saveEdit(b); }} className="mt-3 grid sm:grid-cols-[1.4fr_0.8fr_1fr_auto] gap-2 items-end">
                  <label className="text-[0.625rem] uppercase tracking-widest font-bold text-chalkboard/60">School
                    <input list="box-schools" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className={`${inp} mt-1 normal-case tracking-normal font-normal`} />
                  </label>
                  <label className="text-[0.625rem] uppercase tracking-widest font-bold text-chalkboard/60">Room
                    <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className={`${inp} mt-1 normal-case tracking-normal font-normal`} />
                  </label>
                  <label className="text-[0.625rem] uppercase tracking-widest font-bold text-chalkboard/60">Teacher
                    <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className={`${inp} mt-1 normal-case tracking-normal font-normal`} />
                  </label>
                  <div className="flex gap-1.5">
                    <button type="submit" className="px-3 py-2 rounded-lg bg-apple text-white text-xs font-bold">Save</button>
                    <button type="button" onClick={() => setEditing(null)} aria-label="Cancel" className="p-2 rounded-lg bg-chalkboard/5"><X size={14} /></button>
                  </div>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      <datalist id="box-schools">{SCHOOLS.map((s) => <option key={s} value={s} />)}</datalist>

      <p className="mt-6 text-xs text-chalkboard/70 leading-relaxed">
        Write each box's link to its NFC tag as a URL record (NFC Tools app → Write → Add a record → URL), and use the same link for its QR code.
        Pickup emails go to the address set in FormBold; see the README.
      </p>
    </div>
  );
}
