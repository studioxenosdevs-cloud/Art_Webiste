import { useState, useMemo } from 'react';
import { Inbox, Trash2, Phone, MapPin, Calendar, Mail, Frame, Search, ShoppingBag, CircleAlert as AlertCircle } from 'lucide-react';
import type { InquiryStatus } from '@/types';
import { useStore } from '@/components/admin/useStore';

const STATUS_CONFIG: Record<InquiryStatus, { label: string; classes: string }> = {
  new: { label: 'New', classes: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  contacted: { label: 'Contacted', classes: 'bg-amber-50 text-amber-700 ring-amber-500/20' },
  completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20' },
};

const ALL_STATUSES: InquiryStatus[] = ['new', 'contacted', 'completed'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Inquiries() {
  const { orders, updateOrderStatus, deleteOrder } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter);
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter((o) => o.customerName.toLowerCase().includes(q) || o.phone.toLowerCase().includes(q) || (o.email ?? '').toLowerCase().includes(q) || o.artworkTitle.toLowerCase().includes(q));
    }
    return list;
  }, [orders, filter, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { new: 0, contacted: 0, completed: 0 };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="reveal">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80"><Inbox className="h-3.5 w-3.5" /> Orders Log</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Inquiries & Orders</h1>
        <p className="mt-2 text-sm text-slate-500">Review and manage customer purchase inquiries submitted from the gallery.</p>
      </div>

      <div className="reveal delay-1 flex flex-wrap items-center gap-2">
        <button onClick={() => setStatusFilter('all')} className={`pill-filter flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium ${statusFilter === 'all' ? 'active' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
          All<span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">{orders.length}</span>
        </button>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`pill-filter flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium capitalize ${statusFilter === s ? 'active' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
            {STATUS_CONFIG[s].label}<span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">{statusCounts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="reveal delay-2 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{filtered.length} inquir{filtered.length !== 1 ? 'ies' : 'y'}</p>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search inquiries..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-violet-600/40 focus:outline-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <ShoppingBag className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">{orders.length === 0 ? 'No inquiries yet. Customer submissions will appear here.' : 'No inquiries match your filters.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <div key={order.id} className="reveal glass-card glass-card-hover overflow-hidden rounded-xl" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
              <div className="flex cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50/50" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-600/20">
                  <span className="font-display text-sm font-bold">{order.customerName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{order.customerName}</p>
                  <p className="truncate text-xs text-slate-400">{order.artworkTitle} · {formatDate(order.createdAt)}</p>
                </div>
                <select value={order.status} onClick={(e) => e.stopPropagation()} onChange={(e) => updateOrderStatus(order.id, e.target.value as InquiryStatus)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 outline-none transition-all ${STATUS_CONFIG[order.status].classes} cursor-pointer`}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s} className="bg-white text-slate-900">{STATUS_CONFIG[s].label}</option>)}
                </select>
                {order.customFraming && <span className="hidden items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 ring-1 ring-violet-600/15 sm:flex"><Frame className="h-3 w-3" /> Framing</span>}
                <button onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
              </div>

              {expanded === order.id && (
                <div className="animate-fade-in border-t border-slate-200 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <OrderDetail icon={<Phone className="h-3.5 w-3.5" />} label="WhatsApp / Phone" value={order.phone} />
                    {order.email && <OrderDetail icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={order.email} />}
                    <OrderDetail icon={<MapPin className="h-3.5 w-3.5" />} label="Delivery Address" value={order.shippingAddress} />
                    <OrderDetail icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={formatDate(order.createdAt)} />
                    <OrderDetail icon={<Frame className="h-3.5 w-3.5" />} label="Custom Framing" value={order.customFraming ? 'Yes — requested' : 'No'} />
                    {order.notes && <OrderDetail icon={<AlertCircle className="h-3.5 w-3.5" />} label="Notes" value={order.notes} />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-slate-50/50 p-3">
      <span className="mt-0.5 text-violet-600/70">{icon}</span>
      <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className="text-sm text-slate-700">{value}</p></div>
    </div>
  );
}
