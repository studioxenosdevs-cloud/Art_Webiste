import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useStore } from '@/components/admin/useStore';

export default function ReviewsManager() {
    const { reviews, addReview, deleteReview } = useStore();
    const [author, setAuthor] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!author.trim() || !message.trim()) return;
        setLoading(true);
        try {
            await addReview({ author: author.trim(), message: message.trim(), rating });
            setAuthor(''); setMessage(''); setRating(5);
        } catch (err) {
            console.error('Add review failed:', err);
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Reviews</h2>
                <div className="flex items-center gap-2">
                    <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="form-input" />
                    <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="form-input" />
                    <input type="number" min={0} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-input w-20" />
                    <button onClick={handleAdd} disabled={loading} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
                </div>
            </div>

            <div className="space-y-3">
                {reviews.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                            <div className="font-medium">{r.author} <span className="text-xs text-slate-400">· {r.rating ?? '—'}</span></div>
                            <div className="text-sm text-slate-600">{r.message}</div>
                        </div>
                        <div>
                            <button onClick={() => deleteReview(r.id)} className="text-rose-600 hover:text-rose-800"><Trash2 /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
