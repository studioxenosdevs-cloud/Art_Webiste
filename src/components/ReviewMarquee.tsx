import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mapReviewFromDB, type Review } from '@/lib/mappers';
import { X, Star } from 'lucide-react';

export default function ReviewMarquee() {
    const [open, setOpen] = useState(false);
    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);

    useEffect(() => {
        return onSnapshot(
            query(collection(db, 'reviews'), orderBy('createdAt', 'desc')),
            (snapshot) => {
                const all = snapshot.docs.map((item) =>
                    mapReviewFromDB({ id: item.id, ...(item.data() as Record<string, unknown>) }),
                );
                setApprovedReviews(all.filter((r) => r.isApproved));
            },
            (error) => console.error('Review Fetch Error:', error),
        );
    }, []);

    // Duplicate the list for seamless looping
    const doubled = useMemo(() => [...approvedReviews, ...approvedReviews], [approvedReviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        try {
            await addDoc(collection(db, 'reviews'), {
                author: author.trim() || 'Anonymous',
                rating: Number(rating) || null,
                message: comment.trim(),
                isApproved: false,
                createdAt: new Date().toISOString(),
            });
            setSubmitted(true);
            setAuthor(''); setComment(''); setRating(5);
        } catch (err) {
            console.error('Review Exception:', err);
            setSubmitError(err instanceof Error ? err.message : 'Unable to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="overflow-hidden py-4">
            <style>{`
        .marquee-track { display:flex; gap:1rem; align-items:center; white-space:nowrap; }
        .marquee { display:block; overflow:hidden; }
        .marquee-track-inner { display:flex; gap:1rem; animation: marquee 20s linear infinite; }
        .marquee-item { display:inline-flex; align-items:center; gap:0.75rem; padding:0.5rem 1rem; background:rgba(255,255,255,0.8); border-radius:9999px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
        .marquee-item .comment { max-width:40ch; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .marquee-item .author { font-weight:600; margin-right:0.5rem; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .marquee-track-inner:hover { animation-play-state: paused; }
      `}</style>

            {doubled.length > 0 && (
                <div className="marquee">
                    <div className="marquee-track">
                        <div className="marquee-track-inner">
                            {doubled.map((r, idx) => (
                                // Use stable key: id + position-in-doubled-array
                                <div key={`${r.id}-${idx}`} className="marquee-item">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm text-slate-600">
                                        {r.author?.charAt(0) ?? '?'}
                                    </div>
                                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <span className="author">{r.author}</span>
                                            {r.rating != null && r.rating > 0 && (
                                                <span style={{ color: '#D97706' }}>
                                                    {Array.from({ length: Math.max(0, Math.round(r.rating)) }).map((_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                </span>
                                            )}
                                        </div>
                                        <div className="comment">{r.message}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center justify-center">
                <button
                    onClick={() => { setOpen(true); setSubmitted(false); setSubmitError(''); }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98]"
                >
                    <Star className="h-4 w-4" /> Leave a Review
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setOpen(false)}>
                    <div className="glass-card animate-zoom-in bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-lg font-semibold text-slate-900">Leave a Review</h3>
                            <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-violet-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {submitted ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                Thank you! Your review has been submitted for approval.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Your Name</label>
                                    <input className="form-input" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Anonymous" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Rating (1–5)</label>
                                    <input type="number" min={1} max={5} className="form-input" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Your Review</label>
                                    <textarea className="form-input resize-none" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience…" />
                                </div>

                                {submitError && (
                                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                                        {submitError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                                    >
                                        {submitting ? (
                                            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</>
                                        ) : (
                                            'Submit Review'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
