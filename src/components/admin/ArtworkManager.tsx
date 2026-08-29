import { useState } from 'react';
import { Plus, Trash2, CreditCard as Edit3, X, Image as ImageIcon, DollarSign, Ruler, Palette as PaletteIcon, Save, CircleAlert as AlertCircle } from 'lucide-react';
import type { Artwork, ArtCategory, ArtStatus } from '@/types';
import { useStore } from '@/components/admin/useStore';
import { supabase } from '@/lib/supabase';

const CATEGORIES: { value: ArtCategory; label: string }[] = [
    { value: 'sufi', label: 'Sufi Art' },
    { value: 'calligraphy', label: 'Islamic Calligraphy' },
    { value: 'nature', label: 'Nature & Landscape' },
    { value: 'custom', label: 'Custom / Personalized Art' },
];

const CANVAS_SIZES = [
    '12 × 12 inches',
    '12 × 18 inches',
    '18 × 18 inches',
    '18 × 24 inches',
    '24 × 24 inches',
    '30 × 30 inches',
    '24 × 36 inches',
];

function formatPKR(amount: number): string {
    return amount.toLocaleString('en-PK') + ' PKR';
}

export default function ArtworkManager() {
    const { artworks, addArtwork, updateArtwork, deleteArtwork, toggleArtworkStatus } = useStore();
    const [editing, setEditing] = useState<Artwork | null>(null);
    const [showForm, setShowForm] = useState(false);

    const openNew = () => { setEditing(null); setShowForm(true); };
    const openEdit = (art: Artwork) => { setEditing(art); setShowForm(true); };
    const closeForm = () => { setEditing(null); setShowForm(false); };

    const handleSave = (data: Omit<Artwork, 'id'>) => {
        if (editing) updateArtwork(editing.id, data);
        else addArtwork(data);
        closeForm();
    };

    return (
        <div className="space-y-6">
            {/* Page Title Header */}
            <div className="reveal">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-violet-600">
                    <ImageIcon className="h-3.5 w-3.5" /> Artwork Manager
                </div>
                <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">Product Catalog</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Add, edit, and manage your artwork listings. Changes sync instantly to the public gallery.
                </p>
            </div>

            {/* Control Actions Bar */}
            <div className="reveal delay-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-500">
                    {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} in your collection
                </p>
                <button
                    onClick={openNew}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" /> Add New Artwork
                </button>
            </div>

            {/* Responsive Table / Card Container */}
            <div className="reveal delay-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">

                {/* Desktop / Tablet Table View */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">Artwork</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="hidden lg:table-cell px-4 py-3 font-medium">Medium</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {artworks.map((art) => (
                                <tr key={art.id} className="transition-colors hover:bg-slate-50/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={art.imageUrl} alt={art.title} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200" loading="lazy" decoding="async" />
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-slate-900">{art.title}</p>
                                                <p className="text-xs text-slate-400">{art.dimensions}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {CATEGORIES.find((c) => c.value === art.category)?.label}
                                    </td>
                                    <td className="hidden lg:table-cell px-4 py-3 text-slate-500">{art.medium}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-display font-semibold text-violet-700">{formatPKR(art.pricePKR)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleArtworkStatus(art.id)}
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${art.status === 'sold'
                                                ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20 hover:bg-rose-100'
                                                : 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 hover:bg-violet-100'
                                                }`}
                                        >
                                            {art.status === 'sold' ? 'Sold' : 'Available'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(art)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-700" title="Edit">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => deleteArtwork(art.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {artworks.map((art) => (
                        <div key={art.id} className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <img src={art.imageUrl} alt={art.title} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200" loading="lazy" decoding="async" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-900">{art.title}</p>
                                    <p className="text-xs text-slate-500">{CATEGORIES.find((c) => c.value === art.category)?.label}</p>
                                    <p className="text-xs text-slate-400">{art.dimensions}</p>
                                </div>
                                <button
                                    onClick={() => toggleArtworkStatus(art.id)}
                                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${art.status === 'sold' ? 'bg-rose-50 text-rose-600' : 'bg-violet-50 text-violet-700'
                                        }`}
                                >
                                    {art.status === 'sold' ? 'Sold' : 'Available'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                                <span className="font-display font-semibold text-violet-700 text-sm">{formatPKR(art.pricePKR)}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEdit(art)} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium text-slate-700">
                                        <Edit3 className="h-3.5 w-3.5" /> Edit
                                    </button>
                                    <button onClick={() => deleteArtwork(art.id)} className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 font-medium text-rose-600">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Empty State */}
            {artworks.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-12 text-center p-4">
                    <ImageIcon className="mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-xs sm:text-sm text-slate-400">No artworks yet. Click "Add New Artwork" to get started.</p>
                </div>
            )}

            {/* Modal Dialog */}
            {showForm && <ArtworkFormModal artwork={editing} onSave={handleSave} onClose={closeForm} />}
        </div>
    );
}

function ArtworkFormModal({ artwork, onSave, onClose }: { artwork: Artwork | null; onSave: (data: Omit<Artwork, 'id'>) => void; onClose: () => void }) {
    const [title, setTitle] = useState(artwork?.title ?? '');
    const [category, setCategory] = useState<ArtCategory>(artwork?.category ?? 'sufi');
    const [medium, setMedium] = useState(artwork?.medium ?? '');
    const [dimensions, setDimensions] = useState(artwork?.dimensions ?? '');
    const [pricePKR, setPricePKR] = useState<string>(artwork ? String(artwork.pricePKR) : '');
    const [status, setStatus] = useState<ArtStatus>(artwork?.status ?? 'available');
    const [imageUrl, setImageUrl] = useState(artwork?.imageUrl ?? '');
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState(artwork?.description ?? '');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !medium.trim() || !dimensions.trim() || (!imageUrl.trim() && !file)) { setError('Please fill in all required fields.'); return; }
        const price = parseInt(pricePKR, 10);
        if (isNaN(price) || price < 0) { setError('Please enter a valid price.'); return; }

        let finalImageUrl = imageUrl.trim();
        if (file) {
            try {
                // Upload to Supabase storage (ensure upload finishes before proceeding)
                const fileExt = file.name.split('.').pop();
                const filePath = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('artworks').upload(filePath, file, { cacheControl: '3600', upsert: false });
                if (uploadError) {
                    console.error('Upload Error:', uploadError);
                    setError('Image upload failed. Please try again.');
                    return;
                }

                const { data: publicData } = supabase.storage.from('artworks').getPublicUrl(filePath);
                finalImageUrl = publicData?.publicUrl ?? '';
            } catch (err: any) {
                console.error('Upload Exception:', err);
                setError('Image upload failed. Please try again.');
                return;
            }
        }

        // sanitize status and price before saving
        const sanitizedStatus = (status ?? 'available').toString().toLowerCase() as ArtStatus;
        onSave({ title: title.trim(), category, medium: medium.trim(), dimensions: dimensions.trim(), pricePKR: price, status: sanitizedStatus, imageUrl: finalImageUrl, description: description.trim() || undefined });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-zoom-in scrollbar-thin" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900">{artwork ? 'Edit Artwork' : 'Add New Artwork'}</h3>
                    <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-violet-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 px-4 sm:px-6 py-4 sm:py-5">
                    {imageUrl && (
                        <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                            <img src={imageUrl} alt="Preview" className="h-36 sm:h-44 w-full object-cover" loading="lazy" decoding="async" />
                        </div>
                    )}

                    <AdminField label="Image URL" icon={<ImageIcon className="h-4 w-4" />} required>
                        <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="form-input" />
                        <div className="mt-2 text-xs text-slate-500">Or upload an image file</div>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2" />
                    </AdminField>

                    <AdminField label="Title" required>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Gold Leaf Calligraphy" className="form-input" />
                    </AdminField>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <AdminField label="Category" icon={<PaletteIcon className="h-4 w-4" />}>
                            <select value={category} onChange={(e) => setCategory(e.target.value as ArtCategory)} className="form-input bg-white">
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </AdminField>

                        <AdminField label="Status">
                            <select value={status} onChange={(e) => setStatus(e.target.value as ArtStatus)} className="form-input bg-white">
                                <option value="available">Available</option>
                                <option value="sold">Sold</option>
                            </select>
                        </AdminField>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <AdminField label="Medium" icon={<PaletteIcon className="h-4 w-4" />} required>
                            <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="e.g. Acrylic on Canvas" className="form-input" />
                        </AdminField>

                        <AdminField label="Dimensions" icon={<Ruler className="h-4 w-4" />} required>
                            <input
                                type="text"
                                list="canvas-size-options"
                                value={dimensions}
                                onChange={(e) => setDimensions(e.target.value)}
                                placeholder="Select or type size (e.g. 24 × 36 inches)"
                                className="form-input"
                            />
                            <datalist id="canvas-size-options">
                                {CANVAS_SIZES.map((size) => (
                                    <option key={size} value={size} />
                                ))}
                            </datalist>
                        </AdminField>
                    </div>

                    <AdminField label="Price (PKR)" icon={<DollarSign className="h-4 w-4" />} required>
                        <input type="number" value={pricePKR} onChange={(e) => setPricePKR(e.target.value)} placeholder="e.g. 15000" min={0} className="form-input" />
                    </AdminField>

                    <AdminField label="Description (optional)">
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description..." rows={3} className="form-input resize-none" />
                    </AdminField>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs sm:text-sm text-rose-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 border-t border-slate-200 pt-4">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg"><Save className="h-4 w-4" /> {artwork ? 'Save Changes' : 'Add Artwork'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AdminField({ label, icon, required, children }: { label: string; icon?: React.ReactNode; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                {icon && <span className="text-slate-400">{icon}</span>}{label}{required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}