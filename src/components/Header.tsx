import { useNavigate } from 'react-router-dom';
import { Palette } from 'lucide-react';

interface HeaderProps {
  onScrollToShowcase: () => void;
}

export default function Header({ onScrollToShowcase }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
              <Palette className="h-5 w-5 text-violet-700" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">Zelbrush</span>
              <span className="text-[10px] tracking-[0.18em] uppercase text-slate-400">Art Studio</span>
            </div>
          </button>

          {/* Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <button
              onClick={onScrollToShowcase}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              Gallery
            </button>
            <button
              onClick={onScrollToShowcase}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              Calligraphy
            </button>
            <button
              onClick={onScrollToShowcase}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              Nature
            </button>
          </nav>

          {/* Online badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-violet-600/20 bg-violet-50 px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
            </span>
            <span className="text-xs font-medium text-violet-700">Open for Commissions</span>
          </div>
        </div>
      </div>
    </header>
  );
}
