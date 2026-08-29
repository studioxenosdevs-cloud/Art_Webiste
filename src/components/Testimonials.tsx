import { Star, Quote, Heart } from 'lucide-react';
import { useGalleryStore } from '@/hooks/useGalleryStore';

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
            ))}
        </div>
    );
}

export default function Testimonials() {
    const { reviews } = useGalleryStore();
    const shown = reviews.slice(0, 4);

    return (
        <section className="relative scroll-mt-32 overflow-hidden py-20 sm:py-28">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-violet-300/12 blur-[120px]" />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="reveal text-center">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80">Verified Buyers</p>
                    <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Reviews & Testimonials</h2>
                    <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-violet-600/60 to-transparent" />
                    <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-500">Real words from collectors who welcomed Zelbrush originals into their homes.</p>
                </div>

                <div className="reveal delay-1 mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {shown.map((r, i) => (
                        <article key={r.id} className="card-sleek glass-card glass-card-hover group relative overflow-hidden rounded-2xl" style={{ animation: `fadeInUp 0.6s ease ${0.1 * i}s both` }}>
                            <Quote className="pointer-events-none absolute right-4 top-4 h-12 w-12 text-violet-600/[0.06]" />

                            <div className="flex flex-col gap-4 p-6">
                                <div className="flex items-center justify-between">
                                    <StarRating rating={Math.max(0, Math.round(Number(r.rating ?? 0)))} />
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                                        <Heart className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" /> Verified Buyer
                                    </span>
                                </div>

                                <p className="text-sm leading-relaxed text-slate-600">"{r.message}"</p>

                                {/* <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                                    <img src={r.image_url ?? 'https://images.pexels.com/photos/7166648/pexels-photo-7166648.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'} alt={`${r.author}'s artwork`} className="h-40 w-full object-cover image-zoom" loading="lazy" decoding="async" />
                                </div> */}

                                <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
                                        <span className="font-display text-sm font-bold text-violet-700">{r.author?.charAt(0)}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900">{r.author}</p>
                                        <p className="text-xs text-slate-400">Verified Collector</p>
                                    </div>
                                    <div className="hidden text-right sm:block">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Published</p>
                                        <p className="max-w-[120px] truncate text-xs text-violet-700">{new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
