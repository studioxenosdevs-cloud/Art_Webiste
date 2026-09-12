import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Artwork, ArtworkRow, InquiryRow, Order, ReviewRow, TimelineEvent, TimelineRow } from '@/types';
import {
    DEFAULT_TIMELINE_STEPS,
    mapArtworkFromDB,
    mapInquiryFromDB,
    mapReviewFromDB,
    mapTimelineFromDB,
} from '@/lib/mappers';
import type { Review } from '@/lib/mappers';
import { isSafeHttpUrl, isValidEmail, sanitizeText } from '@/lib/validation';

// Re-export Review so consumers can import from here if they prefer
export type { Review };

// ---------------------------------------------------------------------------
// LocalStorage caching keys for non-logged-in public visitors
// ---------------------------------------------------------------------------
const INQUIRIES_CACHE_KEY = 'zelbrush_user_inquiries';
const REVIEWS_CACHE_KEY = 'zelbrush_user_reviews';
let galleryChannelSequence = 0;

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string' && message) return message;
    }
    return fallback;
}

function cacheUserInquiryLocally(inquiry: Order) {
    try {
        const stored = localStorage.getItem(INQUIRIES_CACHE_KEY);
        const parsed: Order[] = stored ? JSON.parse(stored) : [];
        const updated = [inquiry, ...parsed.filter((item) => item.id !== inquiry.id)];
        localStorage.setItem(INQUIRIES_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('Failed to cache inquiry locally:', e);
    }
}

function cacheUserReviewLocally(review: Review) {
    try {
        const stored = localStorage.getItem(REVIEWS_CACHE_KEY);
        const parsed: Review[] = stored ? JSON.parse(stored) : [];
        const updated = [review, ...parsed.filter((item) => item.id !== review.id)];
        localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('Failed to cache review locally:', e);
    }
}

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

    const fetchArtworks = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('artworks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback attempt without ordering if created_at column differs
                const fallback = await supabase.from('artworks').select('*');
                if (fallback.data) {
                    const mapped = (fallback.data as ArtworkRow[]).map(mapArtworkFromDB);
                    setArtworks(mapped);
                }
            } else if (data) {
                setArtworks((data as ArtworkRow[]).map(mapArtworkFromDB));
            }
        } catch (err) {
            console.error('Artwork Fetch Error:', err);
        }
    }, []);

    const fetchReviews = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                const fallback = await supabase.from('reviews').select('*');
                if (fallback.data) setReviews((fallback.data as ReviewRow[]).map(mapReviewFromDB));
            } else if (data) {
                setReviews((data as ReviewRow[]).map(mapReviewFromDB));
            }
        } catch (err) {
            console.error('Review Fetch Error:', err);
        }
    }, []);

    const fetchInquiries = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                const fallback = await supabase.from('inquiries').select('*');
                if (fallback.data) setOrders((fallback.data as InquiryRow[]).map(mapInquiryFromDB));
            } else if (data) {
                setOrders((data as InquiryRow[]).map(mapInquiryFromDB));
            }
        } catch (err) {
            console.error('Inquiry Fetch Error:', err);
        }
    }, []);

    const fetchTimeline = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('timeline')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) {
                const fallback = await supabase.from('timeline').select('*');
                if (fallback.data) setTimelineEvents((fallback.data as TimelineRow[]).map(mapTimelineFromDB));
            } else if (data) {
                setTimelineEvents((data as TimelineRow[]).map(mapTimelineFromDB));
            }
        } catch (err) {
            console.error('Timeline Fetch Error:', err);
        }
    }, []);

    useEffect(() => {
        // Use a plain boolean — a ref is not needed here because the callbacks
        // close over the *same* `isMounted` variable declared in this effect
        // closure, so they always see its most-recent value.
        let isMounted = true;

        async function initData() {
            await Promise.all([
                fetchArtworks(),
                fetchReviews(),
                fetchInquiries(),
                fetchTimeline(),
            ]);
            if (isMounted) {
                setIsLoading(false);
            }
        }

        initData();

        // Use a unique channel name per effect invocation so that React 18
        // StrictMode double-mounts never share a channel that is still being
        // torn down from the previous mount's cleanup.
        const channelId = `realtime-gallery-${Date.now()}-${galleryChannelSequence++}`;

        // All .on() listeners MUST be chained BEFORE .subscribe() is called.
        // Adding listeners after .subscribe() is a silent no-op in the
        // Supabase Realtime protocol and is the root cause of the line-154 crash.
        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, () => {
                if (isMounted) fetchArtworks();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
                if (isMounted) fetchReviews();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
                if (isMounted) fetchInquiries();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline' }, () => {
                if (isMounted) fetchTimeline();
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.debug('[Realtime] Gallery sync active:', channelId);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error('[Realtime] Subscription error:', status, err);
                }
            });

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [fetchArtworks, fetchReviews, fetchInquiries, fetchTimeline]);

    // -------------------------------------------------------------------------
    // Artwork mutations
    // -------------------------------------------------------------------------

    const addArtwork = useCallback(async (art: Omit<Artwork, 'id'>): Promise<{ id: string | null } & MutationResult> => {
        try {
            if (!sanitizeText(art.title, 160) || !sanitizeText(art.medium, 120) || !sanitizeText(art.dimensions, 80)) {
                return { id: null, error: 'Title, medium, and dimensions are required.' };
            }
            if (!Number.isFinite(Number(art.pricePKR)) || Number(art.pricePKR) < 0 || Number(art.pricePKR) > 100_000_000) {
                return { id: null, error: 'Enter a valid price between 0 and 100,000,000 PKR.' };
            }
            if (!isSafeHttpUrl(art.imageUrl)) return { id: null, error: 'Image URL must use http or https.' };
            const sanitizedArtwork = {
                title: sanitizeText(art.title, 160),
                description: sanitizeText(art.description, 4_000),
                category: art.category || 'sufi',
                medium: sanitizeText(art.medium, 120),
                dimensions: sanitizeText(art.dimensions, 80),
                price_pkr: Number(art.pricePKR) || 0,
                status: art.status || 'available',
                image_url: art.imageUrl || '',
            };

            const { data, error } = await supabase
                .from('artworks')
                .insert([sanitizedArtwork])
                .select()
                .single();

            if (error) throw error;

            const created = mapArtworkFromDB(data as ArtworkRow);
            setArtworks((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
            return { id: created.id, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add artwork.';
            console.error('addArtwork:', message);
            return { id: null, error: message };
        }
    }, []);

    const updateArtwork = useCallback(async (id: string, patch: Partial<Artwork>): Promise<MutationResult> => {
        try {
            const sanitizedPatch: Record<string, unknown> = {};
            if (patch.title !== undefined) sanitizedPatch.title = patch.title?.trim() || '';
            if (patch.description !== undefined) sanitizedPatch.description = patch.description?.trim() || '';
            if (patch.category !== undefined) sanitizedPatch.category = patch.category || 'sufi';
            if (patch.medium !== undefined) sanitizedPatch.medium = patch.medium?.trim() || '';
            if (patch.dimensions !== undefined) sanitizedPatch.dimensions = patch.dimensions?.trim() || '';
            if (patch.pricePKR !== undefined) sanitizedPatch.price_pkr = Number(patch.pricePKR) || 0;
            if (patch.status !== undefined) sanitizedPatch.status = patch.status || 'available';
            if (patch.imageUrl !== undefined) sanitizedPatch.image_url = patch.imageUrl || '';

            const { error } = await supabase
                .from('artworks')
                .update(sanitizedPatch)
                .eq('id', id);

            if (error) throw error;

            setArtworks((prev) =>
                prev.map((a) =>
                    a.id === id
                        ? { ...a, ...patch, description: patch.description !== undefined ? (patch.description.trim() || '') : a.description }
                        : a
                )
            );
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update artwork.';
            console.error('updateArtwork:', message);
            return { error: message };
        }
    }, []);

    const deleteArtwork = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            const { error } = await supabase
                .from('artworks')
                .delete()
                .eq('id', id);

            if (error) throw error;

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
            const nextStatus = artwork.status === 'available' ? 'sold' : 'available';

            const { error } = await supabase
                .from('artworks')
                .update({ status: nextStatus })
                .eq('id', id);

            if (error) throw error;

            setArtworks((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
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
            const customerName = sanitizeText(order.customerName, 120);
            const phone = sanitizeText(order.phone, 40);
            const shippingAddress = sanitizeText(order.shippingAddress, 1000);
            const email = sanitizeText(order.email, 254).toLowerCase();

            if (!customerName) return { order: null, error: 'Please enter your name.' };
            if (!phone) return { order: null, error: 'Please enter your WhatsApp/phone number.' };
            if (!shippingAddress) return { order: null, error: 'Please enter your delivery address.' };
            if (email && !isValidEmail(email)) {
                return { order: null, error: 'Please enter a valid email address.' };
            }

            const sanitizedOrder: Record<string, unknown> = {
                customer_name: customerName,
                artwork_title: sanitizeText(order.artworkTitle, 200),
                phone,
                shipping_address: shippingAddress,
                custom_framing: Boolean(order.customFraming),
                status: 'new' as const,
            };
            const artworkId = sanitizeText(order.artworkId, 200);
            const notes = [
                sanitizeText(order.notes, 2000),
                order.customFraming ? 'Custom framing requested' : '',
            ].filter(Boolean).join(' · ');

            if (artworkId && artworkId !== 'commission') sanitizedOrder.artwork_id = artworkId;
            if (email) sanitizedOrder.email = email;
            if (notes) sanitizedOrder.notes = notes;

            // Public users may insert inquiries but cannot read other customer
            // records. Avoid RETURNING/select here so RLS remains private.
            const { error } = await supabase
                .from('inquiries')
                .insert([sanitizedOrder]);

            if (error) throw error;
            const newOrder: Order = {
                id: `local-${Date.now()}`,
                artworkId: artworkId === 'commission' ? '' : artworkId,
                artworkTitle: sanitizeText(order.artworkTitle, 200),
                customerName,
                email: email || undefined,
                phone,
                shippingAddress,
                customFraming: Boolean(order.customFraming),
                notes: notes || undefined,
                status: 'new',
                createdAt: new Date().toISOString(),
            };
            setOrders((prev) => [newOrder, ...prev.filter((item) => item.id !== newOrder.id)]);

            // Cache locally for non-logged-in public visitors
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session?.user) {
                cacheUserInquiryLocally(newOrder);
            }

            return { order: newOrder, error: null };
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to submit inquiry.');
            console.error('addOrder:', message);
            return { order: null, error: message };
        }
    }, []);

    const updateOrderStatus = useCallback(async (id: string, status: Order['status']): Promise<MutationResult> => {
        try {
            const { error } = await supabase
                .from('inquiries')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

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
            const { error } = await supabase
                .from('inquiries')
                .delete()
                .eq('id', id);

            if (error) throw error;

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
            const message = sanitizeText(review.message, 1_500);
            const rating = Number(review.rating ?? 5);
            if (!message) return { review: null, error: 'A review message is required.' };
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { review: null, error: 'Rating must be a whole number from 1 to 5.' };
            const sanitizedReview = {
                author_name: sanitizeText(review.author, 100) || 'Anonymous',
                comment: message,
                rating,
                is_approved: Boolean(review.isApproved),
            };

            const { data, error } = await supabase
                .from('reviews')
                .insert([sanitizedReview])
                .select()
                .single();

            if (error) throw error;

            const mapped = mapReviewFromDB(data as ReviewRow);
            setReviews((prev) => [mapped, ...prev.filter((item) => item.id !== mapped.id)]);

            // Cache locally for non-logged-in public visitors
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session?.user) {
                cacheUserReviewLocally(mapped);
            }

            return { review: mapped, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add review.';
            console.error('addReview:', message);
            return { review: null, error: message };
        }
    }, []);

    const deleteReview = useCallback(async (id: string): Promise<MutationResult> => {
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;

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
            const { error } = await supabase
                .from('reviews')
                .update({ is_approved: approve })
                .eq('id', id);

            if (error) throw error;

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
            const sanitizedPatch: Record<string, unknown> = {};
            if (patch.author !== undefined) sanitizedPatch.author_name = patch.author.trim() || 'Anonymous';
            if (patch.message !== undefined) sanitizedPatch.comment = patch.message.trim();
            if (patch.rating !== undefined) sanitizedPatch.rating = Number(patch.rating) || 5;
            if (patch.isApproved !== undefined) sanitizedPatch.is_approved = Boolean(patch.isApproved);

            const { error } = await supabase
                .from('reviews')
                .update(sanitizedPatch)
                .eq('id', id);

            if (error) throw error;

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
            if (!sanitizeText(event.stepNumber, 30) || !sanitizeText(event.title, 160) || !sanitizeText(event.description, 4_000)) {
                return { id: null, error: 'Step number, title, and description are required.' };
            }
            if (!Number.isInteger(Number(event.order)) || Number(event.order) < 0) return { id: null, error: 'Sort order must be a non-negative whole number.' };
            if (!isSafeHttpUrl(event.imageUrl ?? '')) return { id: null, error: 'Image URL must use http or https.' };
            const sanitized = {
                sort_order: Number(event.order) || 0,
                step_number: event.stepNumber?.trim() || '01',
                title: event.title?.trim() || '',
                subtitle: event.subtitle?.trim() || '',
                description: event.description?.trim() || '',
                badge: event.badge?.trim() || '',
                accent: event.accent || 'from-violet-100 to-violet-200/50',
                icon_name: event.iconName || 'Sparkles',
                image_url: event.imageUrl || '',
            };

            const { data, error } = await supabase
                .from('timeline')
                .insert([sanitized])
                .select()
                .single();

            if (error) throw error;

            const newEvent = mapTimelineFromDB(data as TimelineRow);
            setTimelineEvents((prev) => {
                if (prev.some((item) => item.id === newEvent.id)) return prev;
                return [...prev, newEvent].sort((a, b) => a.order - b.order);
            });
            return { id: newEvent.id, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add timeline event.';
            console.error('addTimelineEvent:', message);
            return { id: null, error: message };
        }
    }, []);

    const updateTimelineEvent = useCallback(async (id: string, patch: Partial<TimelineEvent>): Promise<MutationResult> => {
        try {
            const sanitizedPatch: Record<string, unknown> = {};
            if (patch.order !== undefined) sanitizedPatch.sort_order = Number(patch.order) || 0;
            if (patch.stepNumber !== undefined) sanitizedPatch.step_number = patch.stepNumber?.trim() || '01';
            if (patch.title !== undefined) sanitizedPatch.title = patch.title?.trim() || '';
            if (patch.subtitle !== undefined) sanitizedPatch.subtitle = patch.subtitle?.trim() || '';
            if (patch.description !== undefined) sanitizedPatch.description = patch.description?.trim() || '';
            if (patch.badge !== undefined) sanitizedPatch.badge = patch.badge?.trim() || '';
            if (patch.accent !== undefined) sanitizedPatch.accent = patch.accent || 'from-violet-100 to-violet-200/50';
            if (patch.iconName !== undefined) sanitizedPatch.icon_name = patch.iconName || 'Sparkles';
            if (patch.imageUrl !== undefined) sanitizedPatch.image_url = patch.imageUrl || '';

            const { error } = await supabase
                .from('timeline')
                .update(sanitizedPatch)
                .eq('id', id);

            if (error) throw error;

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
            const { error } = await supabase
                .from('timeline')
                .delete()
                .eq('id', id);

            if (error) throw error;

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
            const steps = DEFAULT_TIMELINE_STEPS.map((step) => ({
                sort_order: step.order,
                step_number: step.stepNumber,
                title: step.title,
                subtitle: step.subtitle,
                description: step.description,
                badge: step.badge,
                accent: step.accent,
                icon_name: step.iconName,
                image_url: step.imageUrl || '',
            }));

            const { error } = await supabase
                .from('timeline')
                .insert(steps);

            if (error) throw error;

            await fetchTimeline();
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to initialize default timeline.';
            console.error('seedDefaultTimeline:', message);
            return { error: message };
        }
    }, [fetchTimeline]);

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
