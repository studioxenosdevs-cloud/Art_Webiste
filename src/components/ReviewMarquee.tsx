import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mapReviewFromDB } from '@/lib/mappers';

export default function ReviewMarquee() {
    // local state only — public display uses direct Supabase queries
    const [open, setOpen] = useState(false);
    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // fetch approved reviews directly for public display
    const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data, error } = await supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false });
                if (error) {
                    console.error('Review Fetch Error:', error);
                    return;
                }
                if (!mounted) return;
                setApprovedReviews((data ?? []).map(mapReviewFromDB));
            } catch (err) {
                console.error('Review Fetch Exception:', err);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Duplicate the list for seamless looping
    const doubled = useMemo(() => [...approvedReviews, ...approvedReviews], [approvedReviews]);

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
        /* pause on hover */
        .marquee-track-inner:hover { animation-play-state: paused; }
      `}</style>

            <div className="marquee">
                <div className="marquee-track">
                    <div className="marquee-track-inner">
                        {doubled.map((r) => (
                            <div key={`${r.id}-${r.createdAt}-${Math.random()}`} className="marquee-item">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm text-slate-600">{r.author?.charAt(0) ?? '?'}</div>
                                <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span className="author">{r.author}</span>
                                        <span style={{ color: '#D97706' }}>
                                            {Array.from({ length: Math.max(0, Math.round(Number(r.rating ?? 0))) }).map((_, i) => (
                                                <span key={i}>★</span>
                                            ))}
                                        </span>
                                    </div>
                                    <div className="comment">{r.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
                <button onClick={() => setOpen(true)} className="rounded-lg bg-violet-600 px-3 py-2 text-sm text-white">Leave a Review</button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-display text-lg font-semibold mb-2">Leave a Review</h3>
                        {submitted ? (
                            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700">Thank you! Your review has been submitted for approval.</div>
                        ) : (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                try {
                                    const insert = [{ author_name: author.trim() || 'Anonymous', rating: Number(rating) || null, comment: comment.trim(), is_approved: false }];
                                    const { data, error } = await supabase.from('reviews').insert(insert).select().single();
                                    if (error) {
                                        console.error('Review Error:', error);
                                        // show generic error to user
                                        alert('Unable to submit review. Please try again.');
                                    } else {
                                        setSubmitted(true);
                                        setAuthor(''); setComment(''); setRating(5);
                                    }
                                } catch (err) {
                                    console.error('Review Exception:', err);
                                    alert('Unable to submit review. Please try again.');
                                } finally { setSubmitting(false); }
                            }}>
                                <label className="block text-xs text-slate-500">Name</label>
                                <input className="form-input mb-2" value={author} onChange={(e) => setAuthor(e.target.value)} />
                                <label className="block text-xs text-slate-500">Rating</label>
                                <input type="number" min={1} max={5} className="form-input mb-2" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                                <label className="block text-xs text-slate-500">Comment</label>
                                <textarea className="form-input mb-3" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setOpen(false)} className="btn">Cancel</button>
                                    <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting…' : 'Submit'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
