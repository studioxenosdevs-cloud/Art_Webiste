import { useEffect, useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Tag, Ruler, Palette as PaletteIcon, ShoppingBag } from 'lucide-react';
import type { Artwork } from '@/types';

interface LightboxProps {
    art: Artwork | null;
    list: Artwork[];
    onClose: () => void;
    onNavigate: (art: Artwork) => void;
    onInquire: (art: Artwork) => void;
}

function formatPKR(amount: number): string {
    return amount.toLocaleString('en-PK') + ' PKR';
}

export default function Lightbox({ art, list, onClose, onNavigate, onInquire }: LightboxProps) {
    const [zoomed, setZoomed] = useState(false);

    useEffect(() => { setZoomed(false); }, [art]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!art) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [art, list]);

    if (!art) return null;

    const currentIndex = list.findIndex((a) => a.id === art.id);
    const prev = () => { if (currentIndex > 0) onNavigate(list[currentIndex - 1]); };
    const next = () => { if (currentIndex < list.length - 1) onNavigate(list[currentIndex + 1]); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in bg-slate-900/80 backdrop-blur-md" onClick={onClose}>
            <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-200 ring-1 ring-white/20 transition-all hover:bg-white/20 hover:text-violet-300">
                <X className="h-5 w-5" />
            </button>

            {currentIndex > 0 && (
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-slate-200 ring-1 ring-white/20 transition-all hover:bg-white/20 hover:text-violet-300">
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}
            {currentIndex < list.length - 1 && (
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-slate-200 ring-1 ring-white/20 transition-all hover:bg-white/20 hover:text-violet-300">
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}

            <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col gap-6 px-4 py-4 animate-zoom-in lg:flex-row lg:items-center" onClick={(e) => e.stopPropagation()}>
                <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                    <img src={art.imageUrl} alt={art.title} className={`lightbox-img max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl ${zoomed ? 'zoomed' : ''}`} onClick={() => setZoomed((z) => !z)} loading="lazy" decoding="async" />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-300 ring-1 ring-white/10 backdrop-blur-sm">
                        <ZoomIn className="h-3 w-3" /> Click to {zoomed ? 'zoom out' : 'zoom in'}
                    </div>
                </div>

                <div className="flex w-full flex-col gap-4 lg:w-80 lg:flex-shrink-0">
                    <div>
                        <span className={`mb-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${art.status === 'sold' ? 'bg-rose-50 text-rose-600 ring-rose-500/30' : 'bg-violet-50 text-violet-700 ring-violet-600/30'
                            }`}>
                            {art.status === 'sold' ? 'Sold' : 'Available'}
                        </span>
                        <h2 className="font-display text-2xl font-bold leading-tight text-white">{art.title}</h2>
                    </div>

                    {art.description && <p className="text-sm leading-relaxed text-slate-300">{art.description}</p>}

                    <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2.5 text-sm">
                            <PaletteIcon className="h-4 w-4 text-violet-400/70" />
                            <span className="text-slate-400">Medium</span>
                            <span className="ml-auto font-medium text-slate-200">{art.medium}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                            <Ruler className="h-4 w-4 text-violet-400/70" />
                            <span className="text-slate-400">Dimensions</span>
                            <span className="ml-auto font-medium text-slate-200">{art.dimensions}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                            <Tag className="h-4 w-4 text-violet-400/70" />
                            <span className="text-slate-400">Price</span>
                            <span className="ml-auto font-display text-lg font-semibold text-violet-400">{formatPKR(art.pricePKR)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => { onInquire(art); onClose(); }}
                        disabled={art.status === 'sold'}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${art.status === 'sold' ? 'cursor-not-allowed bg-white/5 text-slate-500' : 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] hover:scale-[1.02]'
                            }`}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {art.status === 'sold' ? 'Sold Out' : 'Inquire to Buy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
