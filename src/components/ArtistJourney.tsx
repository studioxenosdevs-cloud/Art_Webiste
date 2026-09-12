import React from 'react';
import {
    PencilRuler,
    Brush,
    Frame,
    Sparkles,
    Palette,
    Award,
    Gem,
    Star,
    Compass,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
} from 'lucide-react';
import { useGalleryStore } from '@/hooks/useGalleryStore';
import { DEFAULT_TIMELINE_STEPS } from '@/lib/mappers';
import type { TimelineEvent } from '@/types';

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, React.ReactNode> = {
    PencilRuler: <PencilRuler className="h-5 w-5" />,
    Brush: <Brush className="h-5 w-5" />,
    Frame: <Frame className="h-5 w-5" />,
    Sparkles: <Sparkles className="h-5 w-5" />,
    Palette: <Palette className="h-5 w-5" />,
    Award: <Award className="h-5 w-5" />,
    Gem: <Gem className="h-5 w-5" />,
    Star: <Star className="h-5 w-5" />,
    Compass: <Compass className="h-5 w-5" />,
};

export default function ArtistJourney() {
    const { timelineEvents } = useGalleryStore();

    // Use dynamic Firestore timeline events if available, or fall back to default steps
    const displayedEvents: TimelineEvent[] =
        timelineEvents.length > 0
            ? timelineEvents
            : DEFAULT_TIMELINE_STEPS.map((step, idx) => ({ ...step, id: `default-${idx}` }));

    return (
        <section id="artist-journey" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32 bg-slate-50/50">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute right-0 top-1/4 h-[450px] w-[450px] rounded-full bg-violet-400/10 blur-[140px]" />
            <div className="pointer-events-none absolute left-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-amber-300/10 blur-[130px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-300/5 blur-[160px]" />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="reveal text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-violet-700 shadow-sm backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                        Sacred Craft & Timeline
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
                        The Master’s Journey & Studio Process
                    </h2>
                    <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-violet-600 via-amber-400 to-violet-600" />
                    <p className="mx-auto mt-5 text-sm sm:text-base leading-relaxed text-slate-600">
                        From sacred geometric sketches to genuine 24k gold leafing and bespoke museum floater frames — explore the meticulous creative milestones behind every Zelbrush masterwork.
                    </p>
                </div>

                {/* Flowing Luxury Timeline Spine & Nodes */}
                <div className="relative mt-20">
                    {/* Desktop Center Vertical Spine */}
                    <div className="hidden md:block absolute left-1/2 top-4 bottom-8 w-1 -translate-x-1/2 rounded-full timeline-spine shadow-lg shadow-violet-500/20" />

                    {/* Mobile Left Vertical Spine */}
                    <div className="block md:hidden absolute left-6 top-4 bottom-8 w-1 rounded-full timeline-spine shadow-md shadow-violet-500/20" />

                    <div className="space-y-12 sm:space-y-16">
                        {displayedEvents.map((step, idx) => {
                            const isEven = idx % 2 === 0;
                            const iconElement = ICON_MAP[step.iconName || ''] || <Sparkles className="h-5 w-5" />;

                            return (
                                <div
                                    key={step.id}
                                    className="relative flex flex-col md:grid md:grid-cols-2 md:gap-14 items-center group"
                                >
                                    {/* Desktop Left Column */}
                                    <div
                                        className={`w-full ${
                                            isEven ? 'md:text-right md:pr-4' : 'md:order-2 md:text-left md:pl-4'
                                        } pl-14 md:pl-0`}
                                    >
                                        <div
                                            className="card-sleek glass-card glass-card-hover shimmer-luxury group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/10 border border-slate-200/90 bg-white/90 backdrop-blur-xl"
                                            style={{ animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.12 * idx}s both` }}
                                        >
                                            {/* Watermark Step Number */}
                                            <span className="pointer-events-none absolute right-4 top-2 select-none font-display text-6xl font-extrabold text-slate-900/[0.04] transition-transform duration-500 group-hover:scale-110">
                                                {step.stepNumber}
                                            </span>

                                            {/* Badge & Order indicator */}
                                            <div
                                                className={`flex items-center gap-2 mb-4 flex-wrap ${
                                                    isEven ? 'md:justify-end' : 'md:justify-start'
                                                }`}
                                            >
                                                {step.badge && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-600/20 shadow-xs">
                                                        <CheckCircle2 className="h-3 w-3 text-violet-600" />
                                                        {step.badge}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    Step {step.stepNumber}
                                                </span>
                                            </div>

                                            {/* Title & Subtitle */}
                                            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight transition-colors duration-200 group-hover:text-violet-900">
                                                {step.title}
                                            </h3>
                                            {step.subtitle && (
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-600">
                                                    {step.subtitle}
                                                </p>
                                            )}

                                            {/* Description */}
                                            <p className="mt-3.5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
                                                {step.description}
                                            </p>

                                            {/* Optional Milestone Image */}
                                            {step.imageUrl && (
                                                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                                                    <img
                                                        src={step.imageUrl}
                                                        alt={step.title}
                                                        className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Central Timeline Node (Desktop & Mobile Anchor) */}
                                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                                        <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-violet-50 transition-transform duration-300 group-hover:scale-110 group-hover:ring-violet-200">
                                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-600 via-amber-400 to-violet-500 opacity-30 blur-xs transition-opacity duration-300 group-hover:opacity-75" />
                                            <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-md">
                                                {iconElement}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Opposite Column (Visual breathing space or complementary indicator) */}
                                    <div
                                        className={`hidden md:flex items-center ${
                                            isEven ? 'md:order-2 md:justify-start md:pl-4' : 'md:justify-end md:pr-4'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 opacity-60 transition-opacity duration-300 group-hover:opacity-100 group-hover:text-violet-600">
                                            <span>Milestone {step.stepNumber}</span>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
