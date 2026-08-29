import { useMemo, useState } from 'react';
import { Search, Maximize2, ShoppingBag, Check, Tag } from 'lucide-react';
import type { Artwork, ArtCategory } from '@/types';

type FilterKey = 'all' | ArtCategory | 'sold';

interface ShowcaseProps {
    artworks: Artwork[];
    onOpenLightbox: (art: Artwork) => void;
    onInquire: (art: Artwork) => void;
}

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Works' },
    { key: 'sufi', label: 'Sufi Art' },
    { key: 'calligraphy', label: 'Islamic Calligraphy' },
    { key: 'nature', label: 'Nature & Landscape' },
    { key: 'custom', label: 'Custom / Personalized Art' },
    { key: 'sold', label: 'Sold Showcase' },
];

const CATEGORY_LABEL: Record<ArtCategory, string> = {
    sufi: 'Sufi Art',
    calligraphy: 'Calligraphy',
    nature: 'Nature',
    custom: 'Custom',
};

function formatPKR(amount: number): string {
    return amount.toLocaleString('en-PK') + ' PKR';
}

export default function Showcase({ artworks, onOpenLightbox, onInquire }: ShowcaseProps) {
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let list = artworks;
        if (activeFilter === 'sold') {
            list = list.filter((a) => a.status === 'sold');
        } else if (activeFilter !== 'all') {
            list = list.filter((a) => a.category === activeFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    a.medium.toLowerCase().includes(q) ||
                    a.category.toLowerCase().includes(q)
            );
        }
        return list;
    }, [artworks, activeFilter, search]);

    const counts = useMemo(() => {
        const map: Record<string, number> = {
            all: artworks.length,
            sufi: artworks.filter((a) => a.category === 'sufi').length,
            calligraphy: artworks.filter((a) => a.category === 'calligraphy').length,
            nature: artworks.filter((a) => a.category === 'nature').length,
            custom: artworks.filter((a) => a.category === 'custom').length,
            sold: artworks.filter((a) => a.status === 'sold').length,
        };
        return map;
    }, [artworks]);

    return (
        <section id="showcase" className="relative scroll-mt-32 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal mb-10 text-center">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600/80">Portfolio</p>
                    <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Showcase Gallery</h2>
                    <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-violet-600/60 to-transparent" />
                </div>

                <div className="reveal delay-1 mb-8 flex flex-col items-center gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`pill-filter flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium ${activeFilter === f.key
                                        ? 'active'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                {f.label}
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${activeFilter === f.key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {counts[f.key] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search artworks..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-violet-600/40 focus:outline-none"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Search className="h-7 w-7 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">No artworks found</p>
                        <p className="mt-1 text-sm text-slate-400">Try a different category or search term.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((art, i) => (
                            <ArtworkCard key={art.id} art={art} index={i} onOpenLightbox={() => onOpenLightbox(art)} onInquire={() => onInquire(art)} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ArtworkCard({ art, index, onOpenLightbox, onInquire }: { art: Artwork; index: number; onOpenLightbox: () => void; onInquire: () => void; }) {
    const sold = art.status === 'sold';

    return (
        <article className="card-sleek glass-card glass-card-hover group relative flex flex-col overflow-hidden rounded-2xl" style={{ animation: `fadeInUp 0.6s ease ${Math.min(index * 0.08, 0.4)}s both` }}>
            <div className="relative aspect-[3/4] overflow-hidden">
                <img src={art.imageUrl} alt={art.title} className="h-full w-full object-cover image-zoom" loading="lazy" decoding="async" />

                <div className="absolute left-3 top-3">
                    {sold ? (
                        <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-500/30 backdrop-blur-sm">
                            <Check className="h-3 w-3" /> Sold
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-600/30 backdrop-blur-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse" /> Available
                        </span>
                    )}
                </div>

                <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-600 ring-1 ring-slate-200 backdrop-blur-sm">
                        {CATEGORY_LABEL[art.category]}
                    </span>
                </div>

                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button onClick={onOpenLightbox} className="mb-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-violet-700 ring-1 ring-violet-600/30 backdrop-blur-sm transition-transform hover:scale-105">
                        <Maximize2 className="h-3.5 w-3.5" /> Quick View
                    </button>
                </div>

                {sold && <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-base font-semibold leading-snug text-slate-900">{art.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{art.medium}</p>
                <p className="text-xs text-slate-400">{art.dimensions}</p>

                <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-violet-600/70" />
                        <span className="font-display text-lg font-semibold text-violet-700">{formatPKR(art.pricePKR)}</span>
                    </div>
                    <button
                        onClick={onInquire}
                        disabled={sold}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${sold ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/30 hover:bg-violet-100 hover:scale-105'
                            }`}
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {sold ? 'Sold Out' : 'Inquire to Buy'}
                    </button>
                </div>
            </div>
        </article>
    );
}
