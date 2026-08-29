import { ArrowDown, Heart, Mail, Sparkles, MapPin, Calendar } from 'lucide-react';

interface HeroProps {
    onViewShowcase: () => void;
    onCommission: () => void;
}

export default function Hero({ onViewShowcase, onCommission }: HeroProps) {
    return (
        <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-300/20 blur-[140px] animate-glow-pulse" />
            <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-violet-400/15 blur-[120px] animate-glow-pulse" style={{ animationDelay: '3s' }} />

            <div className="pointer-events-none absolute right-[-80px] top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 opacity-10 lg:block">
                <div className="h-full w-full animate-spin-slow rounded-full border-2 border-dashed border-violet-600/40" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="reveal">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-600/20 bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Handcrafted Original Art since 2020
                        </div>

                        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Sufi Art, Islamic{' '}
                            <span className="text-gradient-violet">Calligraphy</span>{' '}
                            & Nature{' '}
                            <span className="text-gradient-violet">Paintings</span>
                        </h1>

                        <p className="mt-6 max-w-xl text-xl leading-relaxed">
                            <span className="font-display italic text-gradient-violet">
                                "Some hearts write poems. Some hearts paint them"
                            </span>{' '}
                            <Heart className="inline h-4 w-4 animate-heart-beat text-rose-500" />
                        </p>

                        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
                            Each piece by Zelbrush is a one-of-a-kind original — painted with devotion, fine detail, and a love for the craft. Based in Hyderabad, Sindh, Pakistan.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-violet-600" />
                                Hyderabad, Sindh, Pakistan
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-violet-600" />
                                Artist since 2020
                            </span>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={onViewShowcase}
                                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] hover:scale-[1.02]"
                            >
                                Browse Gallery
                                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                            </button>
                            <button
                                onClick={onCommission}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-violet-600/40 hover:text-violet-700"
                            >
                                <Mail className="h-4 w-4" />
                                Request Commission
                            </button>
                        </div>

                        <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                                <span>Studio open for commissions</span>
                            </div>
                            <div className="hidden items-center gap-1.5 sm:flex">
                                <span className="font-display text-lg font-bold text-violet-600">100%</span>
                                <span>Original & handmade</span>
                            </div>
                        </div>
                    </div>

                    <div className="reveal delay-2 relative hidden h-[560px] lg:block">
                        <div className="absolute right-0 top-0 h-[340px] w-[260px] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl animate-float">
                            <img src="https://images.pexels.com/photos/18635120/pexels-photo-18635120.jpeg?auto=compress&cs=tinysrgb&h=900&w=700" alt="Starry Night Palm Trees" className="h-full w-full object-cover image-zoom" loading="eager" decoding="async" />
                        </div>
                        <div className="absolute left-0 top-20 h-[300px] w-[230px] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl animate-float" style={{ animationDelay: '1.5s' }}>
                            <img src="https://images.pexels.com/photos/19892296/pexels-photo-19892296.jpeg?auto=compress&cs=tinysrgb&h=900&w=700" alt="Gold Leaf Calligraphy" className="h-full w-full object-cover image-zoom" loading="eager" decoding="async" />
                        </div>
                        <div className="absolute bottom-0 right-12 h-[260px] w-[200px] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl animate-float" style={{ animationDelay: '3s' }}>
                            <img src="https://images.pexels.com/photos/11673768/pexels-photo-11673768.jpeg?auto=compress&cs=tinysrgb&h=900&w=700" alt="Sufi Art" className="h-full w-full object-cover image-zoom" loading="eager" decoding="async" />
                        </div>
                        <div className="absolute right-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-300/20 blur-[90px]" />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
                    <ArrowDown className="h-4 w-4" />
                </div>
            </div>
        </section>
    );
}
