import { useState } from 'react';
import {
    Sparkles,
    Plus,
    Edit3,
    Trash2,
    ArrowUp,
    ArrowDown,
    X,
    Loader2,
    CircleAlert as AlertCircle,
    CheckCircle,
    RotateCcw,
    Image as ImageIcon,
    Tag,
    ListOrdered,
} from 'lucide-react';
import { useGalleryStore as useStore } from '@/hooks/useGalleryStore';
import { compressImageIfNeeded } from '@/lib/imageCompression';
import { uploadArtworkImage } from '@/lib/storage';
import type { TimelineEvent } from '@/types';

const ICON_OPTIONS = [
    { label: 'Sparkles', value: 'Sparkles' },
    { label: 'Pencil & Ruler', value: 'PencilRuler' },
    { label: 'Artist Brush', value: 'Brush' },
    { label: 'Museum Frame', value: 'Frame' },
    { label: 'Color Palette', value: 'Palette' },
    { label: 'Award & Seal', value: 'Award' },
    { label: 'Gemstone', value: 'Gem' },
    { label: 'Star', value: 'Star' },
    { label: 'Compass', value: 'Compass' },
];

export default function TimelineManager() {
    const {
        timelineEvents,
        addTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        seedDefaultTimeline,
    } = useStore();

    const [editing, setEditing] = useState<TimelineEvent | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const openNew = () => {
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (item: TimelineEvent) => {
        setEditing(item);
        setShowForm(true);
    };

    const closeForm = () => {
        setEditing(null);
        setShowForm(false);
    };

    const handleSave = async (data: Omit<TimelineEvent, 'id'>) => {
        setStatusMessage(null);
        if (editing) {
            const res = await updateTimelineEvent(editing.id, data);
            if (res.error) {
                setStatusMessage({ text: res.error, type: 'error' });
                return;
            }
            setStatusMessage({ text: 'Timeline milestone updated successfully.', type: 'success' });
        } else {
            const res = await addTimelineEvent(data);
            if (res.error) {
                setStatusMessage({ text: res.error, type: 'error' });
                return;
            }
            setStatusMessage({ text: 'New timeline milestone added.', type: 'success' });
        }
        closeForm();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this milestone from the timeline?')) return;
        setDeletingId(id);
        const res = await deleteTimelineEvent(id);
        setDeletingId(null);
        if (res.error) {
            setStatusMessage({ text: res.error, type: 'error' });
        } else {
            setStatusMessage({ text: 'Milestone removed.', type: 'success' });
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= timelineEvents.length) return;

        const current = timelineEvents[index];
        const target = timelineEvents[targetIndex];

        // Swap orders safely
        await updateTimelineEvent(current.id, { order: target.order });
        await updateTimelineEvent(target.id, { order: current.order });
    };

    const handleSeedDefaults = async () => {
        if (
            timelineEvents.length > 0 &&
            !window.confirm('This will append the curated default studio milestones. Proceed?')
        ) {
            return;
        }
        setIsSeeding(true);
        setStatusMessage(null);
        const res = await seedDefaultTimeline();
        setIsSeeding(false);
        if (res.error) {
            setStatusMessage({ text: res.error, type: 'error' });
        } else {
            setStatusMessage({ text: 'Default studio journey milestones populated!', type: 'success' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">
                        <Sparkles className="h-3.5 w-3.5" /> Landing Page Timeline
                    </div>
                    <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                        Artist Journey & Milestones
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Manage the interactive studio timeline displayed on the public landing page. Reorder, add images, and edit copy in real time.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleSeedDefaults}
                        disabled={isSeeding}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-60 transition-all cursor-pointer"
                        title="Add curated default timeline milestones"
                    >
                        {isSeeding ? <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> : <RotateCcw className="h-4 w-4 text-slate-500" />}
                        Seed Defaults
                    </button>

                    <button
                        onClick={openNew}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Add Milestone
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {statusMessage && (
                <div
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm animate-fade-in ${statusMessage.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-rose-200 bg-rose-50 text-rose-800'
                        }`}
                >
                    {statusMessage.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    ) : (
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                    )}
                    <span className="flex-1">{statusMessage.text}</span>
                    <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Timeline Milestones List */}
            <div className="reveal delay-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {timelineEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Sparkles className="h-10 w-10 text-violet-300 mb-3" />
                        <h3 className="font-display text-lg font-semibold text-slate-800">No Custom Milestones Set</h3>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
                            The landing page is currently empty. You can customize it by clicking <strong>"Seed Defaults"</strong> or adding your own custom milestones.
                        </p>
                        <button
                            onClick={handleSeedDefaults}
                            disabled={isSeeding}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="h-4 w-4" /> Populate Default Milestones
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {timelineEvents.map((item, idx) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 transition-colors hover:bg-slate-50/70"
                            >
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                    {/* Reorder Buttons */}
                                    <div className="flex flex-col gap-1 pt-1">
                                        <button
                                            onClick={() => handleMove(idx, 'up')}
                                            disabled={idx === 0}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                            title="Move up"
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleMove(idx, 'down')}
                                            disabled={idx === timelineEvents.length - 1}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                            title="Move down"
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Step Pill */}
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100/70 text-violet-700 font-bold text-sm ring-1 ring-violet-600/10">
                                        {item.stepNumber}
                                    </div>

                                    {/* Details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-slate-900 text-base truncate">
                                                {item.title}
                                            </h4>
                                            {item.badge && (
                                                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-600/20">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {item.subtitle && (
                                            <p className="text-xs font-medium text-violet-600 mt-0.5">
                                                {item.subtitle}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Optional Image Thumbnail */}
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="h-12 w-12 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200 hidden md:block"
                                        />
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 self-end sm:self-center">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-700 transition-colors cursor-pointer"
                                        title="Edit milestone"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deletingId === item.id}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
                                        title="Delete milestone"
                                    >
                                        {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin text-rose-600" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Adding / Editing Milestone */}
            {showForm && (
                <TimelineFormModal
                    event={editing}
                    defaultOrder={timelineEvents.length + 1}
                    onSave={handleSave}
                    onClose={closeForm}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Timeline Form Modal
// ---------------------------------------------------------------------------

function TimelineFormModal({
    event,
    defaultOrder,
    onSave,
    onClose,
}: {
    event: TimelineEvent | null;
    defaultOrder: number;
    onSave: (data: Omit<TimelineEvent, 'id'>) => Promise<void>;
    onClose: () => void;
}) {
    const [stepNumber, setStepNumber] = useState(event?.stepNumber ?? `0${defaultOrder}`);
    const [order, setOrder] = useState<number>(event?.order ?? defaultOrder);
    const [title, setTitle] = useState(event?.title ?? '');
    const [subtitle, setSubtitle] = useState(event?.subtitle ?? '');
    const [description, setDescription] = useState(event?.description ?? '');
    const [badge, setBadge] = useState(event?.badge ?? '');
    const [iconName, setIconName] = useState(event?.iconName ?? 'Sparkles');
    const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? '');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !description.trim() || !stepNumber.trim()) {
            setError('Please provide a step number, title, and description.');
            return;
        }

        setSaving(true);
        let finalImageUrl = imageUrl.trim();

        if (file) {
            try {
                const compressed = await compressImageIfNeeded(file);
                finalImageUrl = await uploadArtworkImage(compressed);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Image upload failed.');
                setSaving(false);
                return;
            }
        }

        await onSave({
            stepNumber: stepNumber.trim(),
            order: Number(order) || 0,
            title: title.trim(),
            subtitle: subtitle.trim(),
            description: description.trim(),
            badge: badge.trim(),
            iconName,
            imageUrl: finalImageUrl,
        });
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div
                className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-zoom-in scrollbar-thin"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                        {event ? 'Edit Milestone' : 'Add New Milestone'}
                    </h3>
                    <button onClick={onClose} disabled={saving} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                                Step Number
                            </label>
                            <input
                                type="text"
                                value={stepNumber}
                                onChange={(e) => setStepNumber(e.target.value)}
                                placeholder="01, Phase 1..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                                Sort Order
                            </label>
                            <div className="relative">
                                <ListOrdered className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Concept & Spiritual Sketch"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                            Subtitle (optional)
                        </label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="e.g. Vision & Sacred Geometry"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                                Badge Tag (optional)
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={badge}
                                    onChange={(e) => setBadge(e.target.value)}
                                    placeholder="Phase 1 · Ideation"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                                Icon
                            </label>
                            <select
                                value={iconName}
                                onChange={(e) => setIconName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-hidden"
                            >
                                {ICON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what happens in this stage..."
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                            Milestone Image (optional)
                        </label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://... or upload below"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm focus:border-violet-500 focus:bg-white focus:outline-hidden"
                            />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="mt-2 text-xs text-slate-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {event ? 'Save Changes' : 'Create Milestone'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
