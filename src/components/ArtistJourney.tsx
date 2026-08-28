import { PencilRuler, Brush, Frame, ArrowRight } from 'lucide-react';

const STEPS = [
  { num: '01', icon: <PencilRuler className="h-6 w-6" />, title: 'Concept & Sketch', desc: 'Every piece begins with a conversation. We discuss your vision, preferred palette, and subject matter — then translate it into a detailed sketch for your approval.', accent: 'from-violet-100 to-violet-200/50' },
  { num: '02', icon: <Brush className="h-6 w-6" />, title: 'Handcrafted Painting & Gold Leafing', desc: 'The approved sketch comes to life with layered acrylics, oils, or 24k gold leaf — each stroke applied by hand with devotion to fine detail and texture.', accent: 'from-violet-100 to-violet-300/40' },
  { num: '03', icon: <Frame className="h-6 w-6" />, title: 'Custom Framing & Safe Delivery', desc: 'Your finished artwork is carefully framed to complement the piece, then securely packaged with protective layers for safe, tracked delivery to your door.', accent: 'from-violet-200/60 to-violet-300/40' },
];

export default function ArtistJourney() {
  return (
    <section className="relative scroll-mt-32 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-violet-300/12 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 bottom-1/4 h-[250px] w-[250px] rounded-full bg-violet-400/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80">The Process</p>
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Artist Journey & Craft</h2>
          <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-violet-600/60 to-transparent" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-500">From the first sketch to the final frame — every piece passes through a meticulous, hands-on creative workflow.</p>
        </div>

        <div className="reveal delay-1 mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {i < STEPS.length - 1 && <div className="pointer-events-none absolute -right-4 top-12 hidden h-px w-8 bg-gradient-to-r from-violet-600/30 to-transparent md:block" />}
              <div className="card-sleek glass-card glass-card-hover group relative overflow-hidden rounded-2xl p-7" style={{ animation: `fadeInUp 0.6s ease ${0.15 * i}s both` }}>
                <span className="pointer-events-none absolute right-4 top-2 font-display text-5xl font-bold text-slate-900/[0.04]">{step.num}</span>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} ring-1 ring-violet-600/20`}>
                  <span className="text-violet-700">{step.icon}</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Step {step.num}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="mt-5 flex items-center gap-1 text-xs font-medium text-violet-600/50">
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
