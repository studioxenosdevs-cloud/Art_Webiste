import { useEffect, useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';

export default function InitialVisitSplash() {
    const [visible, setVisible] = useState(() => {
        // Show once per session
        return !sessionStorage.getItem('zelbrush_intro_shown');
    });
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (!visible) return;

        // Start fading out after 1.1s
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 1100);

        // Remove from DOM after 1.7s
        const removeTimer = setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem('zelbrush_intro_shown', 'true');
        }, 1700);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-700 pointer-events-none ${
                fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
        >
            {/* Ambient radiant background glows */}
            <div className="absolute h-96 w-96 rounded-full bg-violet-600/20 blur-[140px] animate-glow-pulse" />
            <div className="absolute h-72 w-72 rounded-full bg-amber-500/15 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative flex flex-col items-center text-center px-6 animate-zoom-in">
                {/* Gold Crest Icon */}
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-violet-900 p-0.5 shadow-2xl shadow-violet-500/30">
                    <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950/80 backdrop-blur">
                        <Palette className="h-9 w-9 text-amber-400 animate-heart-beat" />
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-300 animate-pulse" />
                </div>

                {/* Studio Title with Gold & Violet Gradients */}
                <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-400/90 mb-2">
                    Studio Exhibition
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                    Zelbrush
                </h1>
                <p className="mt-2 text-xs sm:text-sm font-light tracking-widest text-slate-400 uppercase">
                    Handcrafted Paintings &amp; Sacred Calligraphy
                </p>

                {/* Animated Gold/Violet Silk Line */}
                <div className="mt-8 h-0.5 w-48 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-violet-500 via-amber-400 to-violet-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
