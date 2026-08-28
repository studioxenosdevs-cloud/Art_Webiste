import { useMemo } from 'react';
import { TrendingUp, Package, Inbox, DollarSign, Image as ImageIcon, ArrowUpRight, Tag } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '@/components/admin/useStore';

function formatPKR(amount: number): string {
  return amount.toLocaleString('en-PK') + ' PKR';
}

const CATEGORY_COLORS: Record<string, string> = { sufi: '#8b5cf6', calligraphy: '#7c3aed', nature: '#a78bfa', custom: '#c4b5fd' };
const CATEGORY_LABELS: Record<string, string> = { sufi: 'Sufi Art', calligraphy: 'Calligraphy', nature: 'Nature', custom: 'Custom' };

export default function Overview() {
  const { artworks, orders } = useStore();

  const stats = useMemo(() => {
    const soldArtworks = artworks.filter((a) => a.status === 'sold');
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (artworks.find((a) => a.id === o.artworkId)?.pricePKR ?? 0), 0);
    return { totalRevenue, soldCount: soldArtworks.length, availableCount: artworks.filter((a) => a.status === 'available').length, pendingCount: orders.filter((o) => o.status === 'new' || o.status === 'contacted').length };
  }, [artworks, orders]);

  const salesTrend = useMemo(() => {
    const months: { month: string; revenue: number; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('en-PK', { month: 'short' });
      const monthOrders = orders.filter((o) => { const od = new Date(o.createdAt); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear(); });
      const revenue = monthOrders.reduce((sum, o) => sum + (artworks.find((a) => a.id === o.artworkId)?.pricePKR ?? 0), 0);
      months.push({ month: monthLabel, revenue, count: monthOrders.length });
    }
    return months;
  }, [orders, artworks]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = { sufi: 0, calligraphy: 0, nature: 0, custom: 0 };
    artworks.forEach((a) => { map[a.category] = (map[a.category] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [artworks]);

  return (
    <div className="space-y-8">
      <div className="reveal">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80">
          <ImageIcon className="h-3.5 w-3.5" /> Studio Dashboard
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Overview & Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">A snapshot of your studio's performance, sales, and inventory.</p>
      </div>

      <div className="reveal delay-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Revenue" value={formatPKR(stats.totalRevenue)} icon={<DollarSign className="h-5 w-5" />} accent="violet" trend="+12.5%" />
        <KPICard label="Paintings Sold" value={String(stats.soldCount)} icon={<Tag className="h-5 w-5" />} accent="rose" />
        <KPICard label="Available Inventory" value={String(stats.availableCount)} icon={<Package className="h-5 w-5" />} accent="purple" />
        <KPICard label="Pending Inquiries" value={String(stats.pendingCount)} icon={<Inbox className="h-5 w-5" />} accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="reveal delay-2 glass-card rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div><h3 className="font-display text-lg font-semibold text-slate-900">Monthly Sales Trend</h3><p className="text-xs text-slate-400">Revenue over the last 6 months</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-600/20"><TrendingUp className="h-5 w-5 text-violet-700" /></div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesTrend}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#0f172a' }} formatter={(value) => [formatPKR(Number(value)), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="reveal delay-3 glass-card rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div><h3 className="font-display text-lg font-semibold text-slate-900">Popular Categories</h3><p className="text-xs text-slate-400">Distribution across your collection</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-600/20"><ImageIcon className="h-5 w-5 text-violet-700" /></div>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {categoryData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#7c3aed'} stroke="#fff" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2.5">
                  <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] ?? '#7c3aed' }} />
                  <span className="text-sm text-slate-600">{CATEGORY_LABELS[cat.name] ?? cat.name}</span>
                  <span className="ml-auto font-display text-sm font-bold text-slate-900">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="reveal delay-4 glass-card rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><h3 className="font-display text-lg font-semibold text-slate-900">Inquiries per Month</h3><p className="text-xs text-slate-400">Customer interest over time</p></div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-600/20"><Inbox className="h-5 w-5 text-violet-700" /></div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#0f172a' }} formatter={(value) => [Number(value), 'Inquiries']} />
            <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, accent = 'slate', trend }: { label: string; value: string; icon: React.ReactNode; accent?: 'slate' | 'violet' | 'rose' | 'purple'; trend?: string }) {
  const accentMap = {
    slate: 'text-slate-600 ring-slate-200 bg-slate-50',
    violet: 'text-violet-700 ring-violet-600/20 bg-violet-50',
    rose: 'text-rose-600 ring-rose-500/20 bg-rose-50',
    purple: 'text-violet-700 ring-violet-600/20 bg-violet-50',
  };
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${accentMap[accent]}`}>{icon}</div>
        {trend && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowUpRight className="h-3.5 w-3.5" />{trend}</span>}
      </div>
      <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
