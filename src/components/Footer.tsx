import { Palette, Instagram, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  onCommission: () => void;
  onBackToTop: () => void;
}

export default function Footer({ onCommission, onBackToTop }: FooterProps) {
  return (
    <footer className="relative border-t border-slate-200 bg-white/80 py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/15 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
              <Palette className="h-5 w-5 text-violet-700" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900">Zelbrush</span>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            <span className="font-display italic text-gradient-violet">
              "Some hearts write poems. Some hearts paint them"
            </span>{' '}
            <Heart className="inline h-3.5 w-3.5 text-rose-500" />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://instagram.com/Zel_brush"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-violet-600/40 hover:text-violet-700"
            >
              <Instagram className="h-4 w-4" />
              @Zel_brush
            </a>
            <button
              onClick={onCommission}
              className="rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 ring-1 ring-violet-600/20 transition-all hover:ring-violet-600/40"
            >
              Request Commission
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Sufi Art</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Islamic Calligraphy</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Nature & Landscape</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Custom Art</span>
          </div>

          <div className="flex w-full items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Zelbrush Art Studio · Hyderabad, Sindh, Pakistan. All artworks are original, handcrafted pieces.
            </p>
            <button
              onClick={onBackToTop}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-violet-600/40 hover:text-violet-700"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
