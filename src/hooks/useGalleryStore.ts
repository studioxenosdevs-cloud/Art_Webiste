import { useCallback, useEffect, useState } from 'react';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Artwork, Order, TimelineEvent } from '@/types';
import {
    DEFAULT_TIMELINE_STEPS,
    mapArtworkFromDB,
    mapInquiryFromDB,
    mapReviewFromDB,
    mapTimelineFromDB,
    recordsFromSnapshot,
} from '@/lib/mappers';
import type { Review } from '@/lib/mappers';

// Re-export Review so consumers can import from here if they prefer
export type { Review };

// ---------------------------------------------------------------------------
// Return type of every mutable operation — callers can check .error for UX
// ---------------------------------------------------------------------------
interface MutationResult {
    error: string | null;
}

export function useGalleryStore() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let firstArtworkSnapshot = true;

        const artworkUnsubscribe = onSnapshot(
            query(collection(db, 'artworks'), orderBy('createdAt', 'desc')),
            (snapshot) => {
                const mappedArtworks = recordsFromSnapshot(snapshot).map(mapArtworkFromDB);
                const seen = new Set<string>();
                const uniqueArtworks = mappedArtworks.filter((item) => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
                setArtworks(uniqueArtworks);
                if (firstArtworkSnapshot) {
                    firstArtworkSnapshot = false;
                    setIsLoading(false);
                }
            },
            (error) => {
                console.error('Artwork Fetch Error:', error);
                setIsLoading(false);
            },
        );

        const reviewUnsubscribe = onSnapshot(
            query(collection(db, 'reviews'), orderBy('createdAt', 'desc')),
            (snapshot) => {
                const mappedReviews = recordsFromSnapshot(snapshot).map(mapReviewFromDB);
                const seen = new Set<string>();
                setReviews(mappedReviews.filter((r) => {
                    if (seen.has(r.id)) return false;
                    seen.add(r.id);
                    return true;
                }));
            },
            (error) => console.error('Review Fetch Error:', error),
        );

        const inquiryUnsubscribe = onSnapshot(
            query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
            async (snapshot) => {
                const inquiryRecords = recordsFromSnapshot(snapshot);
                const mapped = await Promise.all(
                    inquiryRecords.map(async (record) => {
                        if (record.artworkId && !record.artworkTitle) {
                            try {
                                const artwork = await getDoc(doc(db, 'artworks', String(record.artworkId)));
                                return mapInquiryFromDB({ ...record, artworkTitle: (artwork.data()?.['title'] as string) ?? '' });
                            } catch {
                                return mapInquiryFromDB(record);
                            }
                        }
                        return mapInquiryFromDB(record);
                    }),
                );
                const seen = new Set<string>();
                setOrders(mapped.filter((o) => {
                    if (seen.has(o.id)) return false;
                    seen.add(o.id);
                    return true;
                }));
            },
            (error) => console.error('Inquiry Fetch Error:', error),
        );

        const timelineUnsubscribe = onSnapshot(
            query(collection(db, 'timeline'), orderBy('order', 'asc')),
            (snapshot) => {
                const mapped = recordsFromSnapshot(snapshot).map(mapTimelineFromDB);
                const seen = new Set<string>();
                setTimelineEvents(mapped.filter((t) => {
                    if (seen.has(t.id)) return false;
                    seen.add(t.id);
                    return true;
                }));
            },
            (error) => console.error('Timeline Fetch Error:', error),
        );

        return () => {
            artworkUnsubscribe();
            reviewUnsubscribe();
            inquiryUnsubscribe();
            timelineUnsubscribe();
        };
    }, []);

    // -------------------------------------------------------------------------
    // Artwork mutations
    // -------------------------------------------------------------------------

    const addArtwork = useCallback(async (art: Omit<Artwork, 'id'>): Promise<{ id: string | null } & MutationResult> => {
        try {
            const createdAt = new Date().toISOString();
            const sanitizedArtwork = {
                title: art.title?.trim() || '',
                description: art.description?.trim() || '',
                category: art.category || 'sufi',
                medium: art.medium?.trim() || '',
                dimensions: art.dimensions?.trim() || '',
                pricePKR: Number(art.pricePKR) || 0,
                status: art.status || 'available',
                imageUrl: art.imageUrl || '',
                createdAt,
            };
            const reference = await addDoc(collection(db, 'artworks'), sanitizedArtwork);
            // Deduplicate: If onSnapshot has already emitted this document via local cache, do not add twice
            setArtworks((prev) => {
                if (prev.some((item) => item.id === reference.id)) return prev;
                return [{ ...sanitizedArtwork, id: reference.id }, ...prev];
            });
            return { id: reference.id, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add artwork.';
            console.error('addArtwork:', message);
            return { id: null, error: message };
        }
    }, []);

    const updateArtwork = useCallback(async (id: string, patch: Partial<Artwork>): Promise<MutationResult> => {
        try {
            const sanitizedPatch: Partial<Artwork> = {};
            if (patch.title !== undefined) sanitizedPatch.title = patch.title?.trim() || '';
            if (patch.description !== undefined) sanitizedPatch.description = patch.description?.trim() || '';
            if (patch.category !== undefined) sanitizedPatch.category = patch.category || 'sufi';
            if (patch.medium !== undefined) sanitizedPatch.medium = patch.medium?.trim() || '';
            if (patch.dimensions !== undefined) sanitizedPatch.dimensions = patch.dimensions?.trim() || '';
            if (patch.pricePKR !== undefined) sanitizedPatch.pricePKR = Number(patch.pricePKR) || 0;
            if (patch.status !== undefined) sanitizedPatch.status = patch.status || 'available';
            if (patch.imageUrl !== undefined) sanitizedPatch.imageUrl = patch.imageUrl || '';

            await updateDoc(doc(db, 'artworks', id), sanitizedPatch);
            setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, description: patch.description !== undefined ? (patch.description.trim() || '') : a.description } : a)));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update artwork.';
            console.error('updateArtwork:', message);
            return { error: message };
        }
    }, []);

    const deleteArtwork = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            await deleteDoc(doc(db, 'artworks', id));
            setArtworks((prev) => prev.filter((a) => a.id !== id));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete artwork.';
            console.error('deleteArtwork:', message);
            return { error: message };
        }
    }, []);

    const toggleArtworkStatus = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            const artwork = artworks.find((item) => item.id === id);
            if (!artwork) return { error: 'Artwork not found.' };
            const status = artwork.status === 'available' ? 'sold' : 'available';
            await updateDoc(doc(db, 'artworks', id), { status });
            setArtworks((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to toggle status.';
            console.error('toggleArtworkStatus:', message);
            return { error: message };
        }
    }, [artworks]);

    // -------------------------------------------------------------------------
    // Order / Inquiry mutations
    // -------------------------------------------------------------------------

    const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<{ order: Order | null } & MutationResult> => {
        try {
            const createdAt = new Date().toISOString();
            const sanitizedOrder = {
                artworkId: order.artworkId || '',
                artworkTitle: order.artworkTitle || '',
                customerName: order.customerName?.trim() || '',
                email: order.email?.trim() || '',
                phone: order.phone?.trim() || '',
                shippingAddress: order.shippingAddress?.trim() || '',
                customFraming: Boolean(order.customFraming),
                notes: order.notes?.trim() || '',
                status: 'new' as const,
                createdAt,
            };
            const reference = await addDoc(collection(db, 'inquiries'), sanitizedOrder);
            const newOrder: Order = { ...sanitizedOrder, id: reference.id };
            setOrders((prev) => {
                if (prev.some((item) => item.id === reference.id)) return prev;
                return [newOrder, ...prev];
            });
            return { order: newOrder, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit inquiry.';
            console.error('addOrder:', message);
            return { order: null, error: message };
        }
    }, []);

    const updateOrderStatus = useCallback(async (id: string, status: Order['status']): Promise<MutationResult> => {
        try {
            await updateDoc(doc(db, 'inquiries', id), { status });
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update order.';
            console.error('updateOrderStatus:', message);
            return { error: message };
        }
    }, []);

    const deleteOrder = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            await deleteDoc(doc(db, 'inquiries', id));
            setOrders((prev) => prev.filter((o) => o.id !== id));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete inquiry.';
            console.error('deleteOrder:', message);
            return { error: message };
        }
    }, []);

    // -------------------------------------------------------------------------
    // Review mutations
    // -------------------------------------------------------------------------

    const addReview = useCallback(async (review: { author: string; message: string; rating?: number; isApproved?: boolean }): Promise<{ review: Review | null } & MutationResult> => {
        try {
            const createdAt = new Date().toISOString();
            const sanitizedReview = {
                author: review.author?.trim() || 'Anonymous',
                message: review.message?.trim() || '',
                rating: Number(review.rating) || 5,
                isApproved: Boolean(review.isApproved),
                createdAt,
            };
            const reference = await addDoc(collection(db, 'reviews'), sanitizedReview);
            const mapped = mapReviewFromDB({ ...sanitizedReview, id: reference.id });
            setReviews((prev) => {
                if (prev.some((item) => item.id === reference.id)) return prev;
                return [mapped, ...prev];
            });
            return { review: mapped, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add review.';
            console.error('addReview:', message);
            return { review: null, error: message };
        }
    }, []);

    const deleteReview = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            await deleteDoc(doc(db, 'reviews', id));
            setReviews((prev) => prev.filter((r) => r.id !== id));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete review.';
            console.error('deleteReview:', message);
            return { error: message };
        }
    }, []);

    const approveReview = useCallback(async (id: string, approve: boolean): Promise<MutationResult> => {
        try {
            await updateDoc(doc(db, 'reviews', id), { isApproved: approve });
            setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: approve } : r)));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update review.';
            console.error('approveReview:', message);
            return { error: message };
        }
    }, []);

    const editReview = useCallback(async (
        id: string,
        patch: { author?: string; message?: string; rating?: number; isApproved?: boolean },
    ): Promise<{ review: Review | null } & MutationResult> => {
        try {
            await updateDoc(doc(db, 'reviews', id), patch);
            setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
            const updated = reviews.find((r) => r.id === id);
            return { review: updated ? { ...updated, ...patch } : null, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to edit review.';
            console.error('editReview:', message);
            return { review: null, error: message };
        }
    }, [reviews]);

    // -------------------------------------------------------------------------
    // Timeline mutations
    // -------------------------------------------------------------------------

    const addTimelineEvent = useCallback(async (event: Omit<TimelineEvent, 'id'>): Promise<{ id: string | null } & MutationResult> => {
        try {
            const sanitized = {
                order: Number(event.order) || 0,
                stepNumber: event.stepNumber?.trim() || '01',
                title: event.title?.trim() || '',
                subtitle: event.subtitle?.trim() || '',
                description: event.description?.trim() || '',
                badge: event.badge?.trim() || '',
                accent: event.accent || 'from-violet-100 to-violet-200/50',
                iconName: event.iconName || 'Sparkles',
                imageUrl: event.imageUrl || '',
            };
            const reference = await addDoc(collection(db, 'timeline'), sanitized);
            const newEvent: TimelineEvent = { ...sanitized, id: reference.id };
            setTimelineEvents((prev) => {
                if (prev.some((item) => item.id === reference.id)) return prev;
                return [...prev, newEvent].sort((a, b) => a.order - b.order);
            });
            return { id: reference.id, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add timeline event.';
            console.error('addTimelineEvent:', message);
            return { id: null, error: message };
        }
    }, []);

    const updateTimelineEvent = useCallback(async (id: string, patch: Partial<TimelineEvent>): Promise<MutationResult> => {
        try {
            const sanitizedPatch: Partial<TimelineEvent> = {};
            if (patch.order !== undefined) sanitizedPatch.order = Number(patch.order) || 0;
            if (patch.stepNumber !== undefined) sanitizedPatch.stepNumber = patch.stepNumber?.trim() || '01';
            if (patch.title !== undefined) sanitizedPatch.title = patch.title?.trim() || '';
            if (patch.subtitle !== undefined) sanitizedPatch.subtitle = patch.subtitle?.trim() || '';
            if (patch.description !== undefined) sanitizedPatch.description = patch.description?.trim() || '';
            if (patch.badge !== undefined) sanitizedPatch.badge = patch.badge?.trim() || '';
            if (patch.accent !== undefined) sanitizedPatch.accent = patch.accent || 'from-violet-100 to-violet-200/50';
            if (patch.iconName !== undefined) sanitizedPatch.iconName = patch.iconName || 'Sparkles';
            if (patch.imageUrl !== undefined) sanitizedPatch.imageUrl = patch.imageUrl || '';

            await updateDoc(doc(db, 'timeline', id), sanitizedPatch);
            setTimelineEvents((prev) =>
                prev.map((t) => (t.id === id ? { ...t, ...patch } : t)).sort((a, b) => a.order - b.order)
            );
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update timeline event.';
            console.error('updateTimelineEvent:', message);
            return { error: message };
        }
    }, []);

    const deleteTimelineEvent = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            await deleteDoc(doc(db, 'timeline', id));
            setTimelineEvents((prev) => prev.filter((t) => t.id !== id));
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete timeline event.';
            console.error('deleteTimelineEvent:', message);
            return { error: message };
        }
    }, []);

    const seedDefaultTimeline = useCallback(async (): Promise<MutationResult> => {
        try {
            for (const step of DEFAULT_TIMELINE_STEPS) {
                await addDoc(collection(db, 'timeline'), step);
            }
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to initialize default timeline.';
            console.error('seedDefaultTimeline:', message);
            return { error: message };
        }
    }, []);

    return {
        // State
        artworks,
        orders,
        reviews,
        timelineEvents,
        isLoading,
        // Artwork
        addArtwork,
        updateArtwork,
        deleteArtwork,
        toggleArtworkStatus,
        // Orders
        addOrder,
        updateOrderStatus,
        deleteOrder,
        // Reviews
        addReview,
        deleteReview,
        approveReview,
        editReview,
        // Timeline
        addTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        seedDefaultTimeline,
    };
}
