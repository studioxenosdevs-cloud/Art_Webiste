import { useMemo, useState } from 'react';
import { Check, Trash2, Edit, X, Star } from 'lucide-react';
import { useGalleryStore } from '@/hooks/useGalleryStore';

export default function AdminReviews() {
    const { reviews, approveReview, editReview, deleteReview } = useGalleryStore();
    const [tab, setTab] = useState<'pending' | 'published'>('pending');
    const [editing, setEditing] = useState<null | { id: string; author: string; message: string; rating?: number }>(null);
    const [saving, setSaving] = useState(false);

    const pending = useMemo(() => reviews.filter((r) => !r.isApproved), [reviews]);
    const published = useMemo(() => reviews.filter((r) => r.isApproved), [reviews]);

    const startEdit = (r: any) => setEditing({ id: r.id, author: r.author, message: r.message, rating: r.rating });

    const doSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            await editReview(editing.id, { author: editing.author, message: editing.message, rating: editing.rating });
            setEditing(null);
        } catch (err) {
            console.error('Edit review failed', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <h2 className="font-display text-lg font-semibold text-slate-900">Reviews</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setTab('pending')} className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'pending' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                        Pending ({pending.length})
                    </button>
                    <button onClick={() => setTab('published')} className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'published' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                        Published ({published.length})
                    </button>
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
                <div className="overflow-x-auto scrollbar-thin rounded-xl border border-slate-100">
                    <table className="w-full table-auto">
                        <thead className="bg-slate-50 text-left text-xs text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Author</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Comment</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(tab === 'pending' ? pending : published).map((r) => (
                                <tr key={r.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 align-top">
                                        <div className="font-medium text-slate-900 truncate max-w-xs">{r.author}</div>
                                        <div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-3 align-top">{r.rating ?? '—'}</td>
                                    <td className="px-4 py-3 align-top max-w-xl">
                                        <div className="text-sm text-slate-700 line-clamp-3">{r.message}</div>
                                    </td>
                                    <td className="px-4 py-3 align-top">{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="flex items-center gap-2">
                                            <button title={r.isApproved ? 'Unpublish' : 'Approve'} onClick={() => approveReview(r.id, !r.isApproved)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100">
                                                <Check className="h-4 w-4 text-green-600" />
                                            </button>
                                            <button title="Edit" onClick={() => startEdit(r)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100">
                                                <Edit className="h-4 w-4 text-slate-700" />
                                            </button>
                                            <button title="Delete" onClick={() => deleteReview(r.id)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100">
                                                <Trash2 className="h-4 w-4 text-rose-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {(tab === 'pending' ? pending : published).map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-100 bg-white p-3">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-slate-900 truncate">{r.author}</div>
                                    <div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="mt-2 text-sm text-slate-700">{r.message}</div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => approveReview(r.id, !r.isApproved)} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-50 text-sm">
                                        <Check className="h-4 w-4 text-green-600" /> {r.isApproved ? 'Unpublish' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button onClick={() => startEdit(r)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => deleteReview(r.id)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
                                    <Trash2 className="h-4 w-4 text-rose-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3" onClick={() => setEditing(null)}>
                    <div className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-900">Edit Review</h3>
                            <button onClick={() => setEditing(null)} className="p-2"><X /></button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block">
                                <div className="text-xs text-slate-500 mb-1">Author</div>
                                <input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="form-input w-full" />
                            </label>

                            <label className="block">
                                <div className="text-xs text-slate-500 mb-1">Rating</div>
                                <input type="number" min={0} max={5} value={editing.rating ?? ''} onChange={(e) => setEditing({ ...editing, rating: e.target.value ? parseInt(e.target.value, 10) : undefined })} className="form-input w-full" />
                            </label>

                            <label className="sm:col-span-2 block">
                                <div className="text-xs text-slate-500 mb-1">Comment</div>
                                <textarea value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} className="form-input w-full" rows={4} />
                            </label>
                        </div>

                        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button onClick={() => setEditing(null)} className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancel</button>
                            <button disabled={saving} onClick={doSave} className="w-full sm:w-auto rounded-xl bg-violet-600 px-4 py-2 text-sm text-white">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
