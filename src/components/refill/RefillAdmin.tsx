import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Copy, Check, Loader2, Plus, Save, Trash2, X, Edit2, ExternalLink, PackageCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { SCHOOLS } from '../../../shared/schools';
import {
  REFILL_ITEMS, REFILL_SHOPS, findRefillItem, aggregateRefillLines, amazonCartUrl, normalizeRefillLines,
  priceRefillOrder, formatRefillPrice, isAsin, MAX_QTY, type RefillLine,
} from '../../../shared/refill';

/**
 * The Mid-Year Refill tab of the admin panel: the purchase list, and the
 * teacher wish lists shown on /refill.
 *
 * ── Purchase list ───────────────────────────────────────────────────────────
 * Every paid order (written by the Stripe webhook into refill_orders) with
 * status 'paid' is summed into one shopping list. "Add all to Amazon cart" is
 * Amazon's add-to-cart form: one click puts every item with an ASIN in the
 * cart of whoever is signed in. Items with no ASIN in shared/refill.ts are
 * listed separately so they are not forgotten. "Mark as ordered" moves those
 * orders to status 'ordered', so the next shopping trip starts from zero.
 *
 * ── Wish lists ──────────────────────────────────────────────────────────────
 * A teacher's request becomes a public list only here, by hand, after the
 * teacher has said we may show it. The label is what the public sees; keep
 * it to what they allowed ("Ms. F., Room 214" or "A biology teacher").
 */

const inp = 'w-full bg-paper border border-chalkboard/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-apple/20 outline-none';
const lbl = 'block text-[0.625rem] uppercase tracking-widest font-bold opacity-40 mb-1';

interface OrderRow {
  id: number;
  created_at: string;
  stripe_session_id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount_total_cents: number;
  gift_cents: number;
  lines: RefillLine[];
  designation_label: string | null;
  list_label: string | null;
  status: string;
  purchased_at: string | null;
}

interface WishlistRow {
  id: number;
  label: string;
  school: string;
  note: string | null;
  items: RefillLine[];
  active: boolean;
  display_order: number;
}

const emptyWishlist = { label: '', school: SCHOOLS[0]?.name ?? '', note: '', items: [] as RefillLine[], active: true, display_order: 0 };

export default function RefillAdmin() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [wishlists, setWishlists] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [wf, setWf] = useState(emptyWishlist);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pickItem, setPickItem] = useState(REFILL_ITEMS[0].id);
  const [pickQty, setPickQty] = useState(1);

  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const [o, w] = await Promise.all([
      supabase.from('refill_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('refill_wishlists').select('*').order('display_order').order('id'),
    ]);
    if (o.error) setError(`Couldn't load orders: ${o.error.message}. Has SUPABASE_REFRESH.sql been run since the refill store was added?`);
    else setOrders((o.data ?? []).map((r) => ({ ...r, lines: normalizeRefillLines(Array.isArray(r.lines) ? r.lines : []) })) as OrderRow[]);
    if (w.error) setError(`Couldn't load wish lists: ${w.error.message}`);
    else setWishlists((w.data ?? []).map((r) => ({ ...r, items: normalizeRefillLines(Array.isArray(r.items) ? r.items : []) })) as WishlistRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const open = useMemo(() => orders.filter((o) => o.status === 'paid'), [orders]);
  const shopping = useMemo(() => aggregateRefillLines(open.map((o) => o.lines)), [open]);
  const cart = useMemo(() => amazonCartUrl(shopping), [shopping]);
  const openTotal = open.reduce((n, o) => n + o.gift_cents, 0);
  const noAsin = REFILL_ITEMS.filter((i) => !isAsin(i.asin)).length;

  const listText = () =>
    shopping.map((l) => {
      const it = findRefillItem(l.itemId)!;
      return `${l.qty}\t${it.name} (${it.pack})\t${it.asin || 'NO ASIN'}`;
    }).join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Qty\tItem\tASIN\n${listText()}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy. Select the list and copy it by hand.');
    }
  };

  const markOrdered = async () => {
    if (!supabase || open.length === 0) return;
    if (!confirm(`Mark ${open.length} paid order(s) as ordered? They leave the shopping list.`)) return;
    setBusy(true);
    const { error: e } = await supabase
      .from('refill_orders')
      .update({ status: 'ordered', purchased_at: new Date().toISOString() })
      .in('id', open.map((o) => o.id));
    if (e) setError(`Could not update orders: ${e.message}`);
    await load();
    setBusy(false);
  };

  const saveWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (wf.items.length === 0) { setError('Add at least one item to the wish list.'); return; }
    setBusy(true);
    setError(null);
    const payload = { label: wf.label, school: wf.school, note: wf.note || null, items: wf.items, active: wf.active, display_order: wf.display_order };
    const op = editingId !== null
      ? supabase.from('refill_wishlists').update(payload).eq('id', editingId)
      : supabase.from('refill_wishlists').insert(payload);
    const { error: err } = await op;
    if (err) setError(`Save failed: ${err.message}`);
    else { setWf(emptyWishlist); setEditingId(null); await load(); }
    setBusy(false);
  };

  const deleteWishlist = async (id: number) => {
    if (!supabase || !confirm('Delete this wish list? This cannot be undone.')) return;
    const { error: err } = await supabase.from('refill_wishlists').delete().eq('id', id);
    if (err) setError(`Delete failed: ${err.message}`);
    await load();
  };

  const addPick = () => {
    setWf((prev) => ({
      ...prev,
      items: normalizeRefillLines([...prev.items.filter((l) => l.itemId !== pickItem), { itemId: pickItem, qty: pickQty }]),
    }));
  };

  if (!supabase) {
    return <p className="p-8 text-sm text-chalkboard/70">Supabase is not configured, so orders and wish lists cannot be loaded.</p>;
  }

  return (
    <div className="p-8 space-y-10">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} aria-label="Dismiss" className="text-red-500"><X size={14} /></button>
        </div>
      )}

      {/* ── Purchase list ── */}
      <section aria-labelledby="purchase-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h3 id="purchase-heading" className="text-base font-bold flex items-center gap-2">
              <ShoppingCart size={16} className="text-apple" aria-hidden="true" /> Amazon purchase list
            </h3>
            <p className="text-xs text-chalkboard/70 mt-1">
              Everything paid for and not yet ordered: {open.length} {open.length === 1 ? 'order' : 'orders'}, {formatRefillPrice(openTotal)} of supplies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cart.url ? (
              <a href={cart.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-apple text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-apple/90">
                <ExternalLink size={14} aria-hidden="true" /> Add all to Amazon cart
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 bg-chalkboard/5 text-chalkboard/60 text-sm font-bold px-4 py-2.5 rounded-xl" title="No item on the list has an ASIN yet">
                <ExternalLink size={14} aria-hidden="true" /> Add all to Amazon cart
              </span>
            )}
            <button onClick={copy} disabled={shopping.length === 0} className="inline-flex items-center gap-2 bg-chalkboard/10 text-chalkboard text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-chalkboard/20 disabled:opacity-40">
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />} {copied ? 'Copied' : 'Copy list'}
            </button>
            <button onClick={markOrdered} disabled={busy || open.length === 0} className="inline-flex items-center gap-2 bg-chalkboard text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-chalkboard/90 disabled:opacity-40">
              {busy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <PackageCheck size={14} aria-hidden="true" />} Mark as ordered
            </button>
          </div>
        </div>

        {noAsin > 0 && (
          <p className="text-xs text-pencil-dark bg-pencil/15 rounded-xl px-4 py-2.5 mb-4 leading-relaxed">
            {noAsin} of {REFILL_ITEMS.length} catalogue items have no Amazon ASIN yet, so the cart link can only carry the rest.
            Paste each product's ASIN (the B0… code in its Amazon URL) into <code className="font-mono">shared/refill.ts</code> and redeploy.
          </p>
        )}

        {loading ? (
          <p className="text-sm text-chalkboard/70 flex items-center gap-2"><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Loading…</p>
        ) : shopping.length === 0 ? (
          <p className="text-sm text-chalkboard/70 italic py-6 text-center">Nothing to buy right now. Paid orders show up here within a minute of checkout.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-chalkboard/10">
            <table className="w-full text-sm">
              <thead className="bg-paper text-[0.625rem] uppercase tracking-widest text-chalkboard/70">
                <tr>
                  <th className="text-right px-3 py-2 font-bold">Qty</th>
                  <th className="text-left px-3 py-2 font-bold">Item</th>
                  <th className="text-left px-3 py-2 font-bold">Shop</th>
                  <th className="text-left px-3 py-2 font-bold">ASIN</th>
                  <th className="text-right px-3 py-2 font-bold">Est.</th>
                </tr>
              </thead>
              <tbody>
                {shopping.map((l) => {
                  const it = findRefillItem(l.itemId)!;
                  const has = isAsin(it.asin);
                  return (
                    <tr key={l.itemId} className="border-t border-chalkboard/10">
                      <td className="text-right px-3 py-2 font-bold tabular-nums">{l.qty}</td>
                      <td className="px-3 py-2">{it.name} <span className="text-chalkboard/60">({it.pack})</span></td>
                      <td className="px-3 py-2 text-chalkboard/70">{REFILL_SHOPS.find((s) => s.id === it.shop)?.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {has ? (
                          <a href={`https://www.amazon.com/dp/${it.asin}`} target="_blank" rel="noopener noreferrer" className="text-ruler underline">{it.asin}</a>
                        ) : (
                          <span className="text-apple font-bold">needs ASIN</span>
                        )}
                      </td>
                      <td className="text-right px-3 py-2 tabular-nums">{formatRefillPrice(it.price * l.qty)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <details className="mt-5" open={showAll} onToggle={(e) => setShowAll((e.target as HTMLDetailsElement).open)}>
            <summary className="cursor-pointer text-xs font-bold text-ruler underline underline-offset-4">
              All orders ({orders.length})
            </summary>
            <ul className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {orders.map((o) => {
                const link = amazonCartUrl(o.lines).url;
                return (
                  <li key={o.id} className="bg-white border border-chalkboard/10 rounded-xl p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">
                        {o.donor_name || o.donor_email || 'Anonymous'} · {formatRefillPrice(o.gift_cents)}
                        {o.designation_label ? ` · ${o.designation_label}` : ''}
                        {o.list_label ? ` · ${o.list_label}` : ''}
                      </span>
                      <span className={cn('px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[0.5625rem]', o.status === 'paid' ? 'bg-pencil/30 text-pencil-dark' : 'bg-apple/10 text-apple')}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-chalkboard/70 mt-1">
                      {new Date(o.created_at).toLocaleDateString()} · {o.lines.map((l) => `${l.qty}× ${findRefillItem(l.itemId)?.name}`).join(', ')}
                    </p>
                    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-ruler underline mt-1 inline-block">This order's Amazon cart</a>}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>

      {/* ── Wish lists ── */}
      <section aria-labelledby="wishlists-heading" className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 id="wishlists-heading" className="text-base font-bold mb-1 flex items-center gap-2">
            {editingId !== null ? <Save size={16} className="text-apple" aria-hidden="true" /> : <Plus size={16} className="text-apple" aria-hidden="true" />}
            {editingId !== null ? 'Edit' : 'Add'} a teacher's wish list
          </h3>
          <p className="text-xs text-chalkboard/70 mb-4 leading-relaxed">
            Only after the teacher has said we may show it. The label is public: use what they allowed.
          </p>
          <form onSubmit={saveWishlist} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Public label</label><input required value={wf.label} onChange={(e) => setWf({ ...wf, label: e.target.value })} className={inp} placeholder="Ms. F., Room 214" maxLength={60} /></div>
              <div><label className={lbl}>School</label>
                <select value={wf.school} onChange={(e) => setWf({ ...wf, school: e.target.value })} className={inp}>
                  {SCHOOLS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
                  <option value="Another Michigan school">Another Michigan school</option>
                </select>
              </div>
            </div>
            <div><label className={lbl}>Note (optional, public)</label><input value={wf.note} onChange={(e) => setWf({ ...wf, note: e.target.value })} className={inp} placeholder="Biology, 150 students, out of goggles since October" maxLength={160} /></div>
            <div>
              <label className={lbl}>Items</label>
              <div className="flex gap-2">
                <select value={pickItem} onChange={(e) => setPickItem(e.target.value)} className={inp} aria-label="Item">
                  {REFILL_SHOPS.map((s) => (
                    <optgroup key={s.id} label={s.name}>
                      {REFILL_ITEMS.filter((i) => i.shop === s.id).map((i) => <option key={i.id} value={i.id}>{i.name} ({i.pack})</option>)}
                    </optgroup>
                  ))}
                </select>
                <input type="number" min={1} max={MAX_QTY} value={pickQty} onChange={(e) => setPickQty(Math.max(1, Math.min(MAX_QTY, Number(e.target.value) || 1)))} className={cn(inp, 'w-20')} aria-label="Quantity" />
                <button type="button" onClick={addPick} className="shrink-0 bg-chalkboard text-white px-3 rounded-xl text-sm font-bold">Add</button>
              </div>
              {wf.items.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {wf.items.map((l) => (
                    <li key={l.itemId} className="flex items-center justify-between text-xs bg-paper rounded-lg px-3 py-1.5">
                      <span>{l.qty}× {findRefillItem(l.itemId)?.name}</span>
                      <button type="button" onClick={() => setWf({ ...wf, items: wf.items.filter((x) => x.itemId !== l.itemId) })} aria-label="Remove item" className="text-chalkboard/60 hover:text-apple"><X size={12} /></button>
                    </li>
                  ))}
                  <li className="text-xs text-chalkboard/70 px-3 pt-1">Total {formatRefillPrice(priceRefillOrder(wf.items, { coverFee: false }).subtotal)}</li>
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div><label className={lbl}>Order (lower first)</label><input type="number" value={wf.display_order} onChange={(e) => setWf({ ...wf, display_order: Number(e.target.value) || 0 })} className={inp} /></div>
              <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={wf.active} onChange={(e) => setWf({ ...wf, active: e.target.checked })} className="accent-[#c0392b]" /> Shown on /refill</label>
            </div>
            <div className="flex gap-3 pt-1">
              {editingId !== null && (
                <button type="button" onClick={() => { setEditingId(null); setWf(emptyWishlist); }} className="flex-1 bg-chalkboard/10 text-chalkboard py-3 rounded-xl font-bold flex items-center justify-center gap-2"><X size={15} />Cancel</button>
              )}
              <button type="submit" disabled={busy} className="flex-[2] bg-apple text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple/90">
                {busy ? <Loader2 size={15} className="animate-spin" /> : editingId !== null ? <><Save size={15} />Update list</> : <><Plus size={15} />Add list</>}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-base font-bold mb-4">Wish lists on /refill <span className="ml-2 text-[0.625rem] font-bold text-chalkboard/70 bg-chalkboard/5 px-2 py-0.5 rounded-full">{wishlists.length}</span></h3>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {wishlists.length === 0 ? (
              <p className="text-center py-12 text-chalkboard/70 italic text-sm">No teacher lists yet. The public page shows FMT's bundles meanwhile.</p>
            ) : wishlists.map((w) => (
              <div key={w.id} className="bg-white p-4 rounded-xl border border-chalkboard/5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{w.label} <span className="text-chalkboard/60 font-normal">· {w.school}</span>{!w.active && <span className="ml-2 text-[0.5625rem] uppercase tracking-wider bg-chalkboard/10 px-1.5 py-0.5 rounded-full">hidden</span>}</p>
                  <p className="text-[0.625rem] text-chalkboard/70 truncate mt-0.5">
                    {w.items.map((l) => `${l.qty}× ${findRefillItem(l.itemId)?.name}`).join(', ')} · {formatRefillPrice(priceRefillOrder(w.items, { coverFee: false }).subtotal)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditingId(w.id); setWf({ label: w.label, school: w.school, note: w.note ?? '', items: w.items, active: w.active, display_order: w.display_order }); }} aria-label="Edit wish list" className="p-2 text-chalkboard/70 hover:text-ruler hover:bg-ruler/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => deleteWishlist(w.id)} aria-label="Delete wish list" className="p-2 text-chalkboard/70 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
