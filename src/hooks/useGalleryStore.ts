import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Artwork, Order } from '@/types';
import { mapArtworkFromDB, mapInquiryFromDB, mapReviewFromDB } from '@/lib/mappers';

export function useGalleryStore() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // Load initial data from Supabase
    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data: arts } = await supabase
                .from('artworks')
                .select('*')
                .order('created_at', { ascending: false });
            const { data: inqs } = await supabase.from('inquiries').select('*, artworks(title)').order('created_at', { ascending: false });
            const { data: revs, error: revsError } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
            if (revsError) console.error('Review Fetch Error (initial):', revsError);
            if (!mounted) return;
            setArtworks((arts ?? []).map(mapArtworkFromDB));
            setOrders((inqs ?? []).map(mapInquiryFromDB));
            setReviews((revs ?? []).map(mapReviewFromDB));

            // realtime subscriptions
            const artChannel = supabase.channel('public:artworks').on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, (payload) => {
                // refresh full list for simplicity
                (async () => {
                    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
                    if (mounted) setArtworks((data ?? []).map(mapArtworkFromDB));
                })();
            }).subscribe();

            const inqChannel = supabase.channel('public:inquiries').on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, (payload) => {
                (async () => {
                    const { data } = await supabase.from('inquiries').select('*, artworks(title)').order('created_at', { ascending: false });
                    if (mounted) setOrders((data ?? []).map(mapInquiryFromDB));
                })();
            }).subscribe();

            const revChannel = supabase.channel('public:reviews').on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
                (async () => {
                    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
                    if (mounted) setReviews((data ?? []).map(mapReviewFromDB));
                })();
            }).subscribe();
        })();
        return () => {
            mounted = false;
            try { supabase.removeChannel?.(/* channel cleanup handled by supabase */); } catch { /* ignore */ }
        };
    }, []);

    const [reviews, setReviews] = useState<Array<{ id: string; author: string; message: string; rating?: number; avatarUrl?: string; image_url?: string; isApproved: boolean; createdAt: string }>>([]);

    const addArtwork = useCallback(async (art: Omit<Artwork, 'id'>) => {
        const insert = {
            title: art.title,
            category: art.category,
            medium: art.medium,
            dimensions: art.dimensions,
            price_pkr: Number.isInteger(art.pricePKR) ? art.pricePKR : parseInt(String(art.pricePKR), 10),
            status: (art.status ?? 'available').toString().toLowerCase(),
            image_url: art.imageUrl,
            description: art.description ?? null,
        };
        const { data, error } = await supabase.from('artworks').insert(insert).select().single();
        if (error || !data) {
            console.error('Database Error (addArtwork):', error);
            throw error ?? new Error('Unable to insert artwork');
        }
        const created: Artwork = {
            id: data.id,
            title: data.title,
            category: data.category,
            medium: data.medium,
            dimensions: data.dimensions,
            pricePKR: data.price_pkr,
            status: data.status,
            imageUrl: data.image_url,
            description: data.description ?? undefined,
        };
        setArtworks((prev) => [created, ...prev]);
        return created.id;
    }, []);

    const addReview = useCallback(async (review: { author: string; message: string; rating?: number; isApproved?: boolean }) => {
        // insert both camelCase and snake_case fields to support different DB schemas
        const insert = {
            author: review.author,
            author_name: review.author,
            message: review.message,
            comment: review.message,
            rating: review.rating ?? null,
            is_approved: !!review.isApproved,
        };
        const { data, error } = await supabase.from('reviews').insert(insert).select().single();
        if (error || !data) {
            console.error('Database Error (addReview):', error);
            console.error('Review Error:', error);
            throw error ?? new Error('Unable to insert review');
        }
        const mapped = mapReviewFromDB(data);
        setReviews((prev) => [mapped, ...prev]);
        return mapped;
    }, []);

    const deleteReview = useCallback(async (id: string) => {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) {
            console.error('Database Error (deleteReview):', error);
            console.error('Review Error:', error);
            throw error;
        }
        setReviews((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const approveReview = useCallback(async (id: string, approve: boolean) => {
        const { error } = await supabase.from('reviews').update({ is_approved: approve }).eq('id', id);
        if (error) {
            console.error('Database Error (approveReview):', error);
            console.error('Review Error:', error);
            throw error;
        }
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: approve } : r)));
    }, []);

    const editReview = useCallback(async (id: string, patch: { author?: string; message?: string; rating?: number; isApproved?: boolean }) => {
        const dbPatch: any = {};
        if (patch.author !== undefined) {
            dbPatch.author = patch.author;
            dbPatch.author_name = patch.author;
        }
        if (patch.message !== undefined) {
            dbPatch.message = patch.message;
            dbPatch.comment = patch.message;
        }
        if (patch.rating !== undefined) dbPatch.rating = patch.rating;
        if (patch.isApproved !== undefined) dbPatch.is_approved = patch.isApproved;
        const { error, data } = await supabase.from('reviews').update(dbPatch).eq('id', id).select().single();
        if (error || !data) {
            console.error('Database Error (editReview):', error);
            console.error('Review Error:', error);
            throw error ?? new Error('Unable to update review');
        }
        const mapped = mapReviewFromDB(data);
        setReviews((prev) => prev.map((r) => (r.id === id ? mapped : r)));
        return mapped;
    }, []);

    const updateArtwork = useCallback(async (id: string, patch: Partial<Artwork>) => {
        const dbPatch: any = {};
        if (patch.title !== undefined) dbPatch.title = patch.title;
        if (patch.category !== undefined) dbPatch.category = patch.category;
        if (patch.medium !== undefined) dbPatch.medium = patch.medium;
        if (patch.dimensions !== undefined) dbPatch.dimensions = patch.dimensions;
        if (patch.pricePKR !== undefined) dbPatch.price_pkr = Number.isInteger(patch.pricePKR) ? patch.pricePKR : parseInt(String(patch.pricePKR), 10);
        if (patch.status !== undefined) dbPatch.status = patch.status.toString().toLowerCase();
        if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;
        if (patch.description !== undefined) dbPatch.description = patch.description;
        try {
            const { error } = await supabase.from('artworks').update(dbPatch).eq('id', id);
            if (error) {
                console.error('Database Error (updateArtwork):', error);
                throw error;
            }
        } catch (err) {
            console.error('Update Exception (updateArtwork):', err);
            throw err;
        }
        setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    }, []);

    const deleteArtwork = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('artworks').delete().eq('id', id);
            if (error) {
                console.error('Database Error (deleteArtwork):', error);
                throw error;
            }
            setArtworks((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error('Delete Exception (deleteArtwork):', err);
            throw err;
        }
    }, []);

    const toggleArtworkStatus = useCallback(async (id: string) => {
        setArtworks((prev) => {
            const updated = prev.map((a) => (a.id === id ? { ...a, status: a.status === 'available' ? 'sold' : 'available' } : a));
            const art = updated.find((x) => x.id === id);
            if (art) {
                supabase.from('artworks').update({ status: art.status }).eq('id', id);
            }
            return updated;
        });
    }, []);

    const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
        const insert = {
            artwork_id: order.artworkId,
            customer_name: order.customerName,
            phone: order.phone,
            message: order.notes ?? null,
        };
        const { data, error } = await supabase.from('inquiries').insert(insert).select().single();
        if (error || !data) {
            console.error('Database Error (addOrder):', error);
            throw error ?? new Error('Unable to insert inquiry');
        }

        // fetch artwork title for display
        const { data: artRow } = await supabase.from('artworks').select('title').eq('id', order.artworkId).single();

        const newOrder: Order = {
            id: data.id,
            artworkId: data.artwork_id,
            artworkTitle: artRow?.title ?? order.artworkTitle ?? '',
            customerName: data.customer_name,
            email: order.email,
            phone: data.phone,
            shippingAddress: order.shippingAddress ?? '',
            customFraming: order.customFraming ?? false,
            notes: data.message ?? undefined,
            status: 'new',
            createdAt: data.created_at,
        };
        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
    }, []);

    const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
        try {
            const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
            if (error) {
                console.error('Database Error (updateOrderStatus):', error);
                throw error;
            }
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        } catch (err) {
            console.error('Update Exception (updateOrderStatus):', err);
            throw err;
        }
    }, []);

    const deleteOrder = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('inquiries').delete().eq('id', id);
            if (error) {
                console.error('Database Error (deleteOrder):', error);
                throw error;
            }
            setOrders((prev) => prev.filter((o) => o.id !== id));
        } catch (err) {
            console.error('Delete Exception (deleteOrder):', err);
            throw err;
        }
    }, []);

    return {
        artworks,
        orders,
        reviews,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        toggleArtworkStatus,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        addReview,
        deleteReview,
        approveReview,
        editReview,
    };
}
