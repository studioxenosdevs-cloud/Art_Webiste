import { Sparkles, Mail, Palette, BookOpen, Ruler } from 'lucide-react';

interface CommissionSectionProps {
  onRequestCommission: () => void;
}

const FEATURES = [
  { icon: <Ruler className="h-5 w-5" />, title: 'Custom Sizes', desc: 'Choose from standard canvas sizes — 12×12 to 24×36 inches — or request a bespoke dimension to fit your space.' },
  { icon: <BookOpen className="h-5 w-5" />, title: 'Quranic Verses', desc: 'Choose a favorite Surah or Ayah rendered in traditional gold leaf Islamic calligraphy.' },
  { icon: <Palette className="h-5 w-5" />, title: 'Color Palette Matching', desc: 'Match your interior decor with a bespoke palette curated just for your walls.' },
];

export default function CommissionSection({ onRequestCommission }: CommissionSectionProps) {
  return (
    <section className="relative scroll-mt-32 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/15 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80">Bespoke Commissions</p>
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Commission a One-of-a-Kind Piece</h2>
          <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-violet-600/60 to-transparent" />
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
            Looking for something deeply personal? Zelbrush creates custom paintings and calligraphy tailored to your vision — whether it's Sufi art, a Quranic verse in gold leaf, a nature landscape, or a personalized piece in your chosen palette.
          </p>
        </div>

        <div className="reveal delay-1 mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card-sleek glass-card glass-card-hover group relative overflow-hidden rounded-2xl p-6" style={{ animation: `fadeInUp 0.6s ease ${0.1 * i}s both` }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
                <span className="text-violet-700">{f.icon}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal delay-2 mt-12 text-center">
          <button onClick={onRequestCommission} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-4 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] hover:scale-[1.02]">
            <Mail className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Request Custom Piece
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-violet-600/70" />
            Studio currently open for commissions — limited slots available
          </p>
        </div>
      </div>
    </section>
  );
}
