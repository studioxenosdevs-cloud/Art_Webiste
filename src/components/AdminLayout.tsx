import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Palette, LayoutDashboard, Image as ImageIcon, Inbox, Settings, LogOut, Chrome as Home, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type TabKey = 'overview' | 'artworks' | 'inquiries' | 'settings';

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode; to: string }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, to: '/admin' },
  { key: 'artworks', label: 'Artworks', icon: <ImageIcon className="h-5 w-5" />, to: '/admin/artworks' },
  { key: 'inquiries', label: 'Inquiries', icon: <Inbox className="h-5 w-5" />, to: '/admin/inquiries' },
  { key: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, to: '/admin/settings' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
            <Palette className="h-5 w-5 text-violet-700" />
          </div>
          <span className="font-display text-lg font-bold text-slate-900">Zelbrush</span>
        </div>
        <button onClick={() => setMobileOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-100">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <aside className={`fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
            <Palette className="h-5 w-5 text-violet-700" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-slate-900">Zelbrush</span>
            <span className="text-[10px] tracking-[0.18em] uppercase text-slate-400">Studio Admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-slate-200 px-3 py-4">
          <button onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700">
            <Home className="h-5 w-5" /> View Gallery
          </button>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50 hover:text-rose-700">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      <main className="lg:pl-64">
        <div className="min-h-screen px-4 pt-20 pb-12 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
