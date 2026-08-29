import type { Artwork, Order } from '@/types';

export function mapArtworkFromDB(a: any): Artwork {
    return {
        id: a.id,
        title: a.title,
        category: a.category,
        medium: a.medium,
        dimensions: a.dimensions,
        pricePKR: a.price_pkr ?? 0,
        status: a.status,
        imageUrl: a.image_url ?? '',
        description: a.description ?? undefined,
    };
}

export function mapInquiryFromDB(i: any): Order {
    return {
        id: i.id,
        artworkId: i.artwork_id,
        artworkTitle: (i.artworks && i.artworks.title) || '',
        customerName: i.customer_name,
        email: i.email ?? undefined,
        phone: i.phone,
        shippingAddress: i.shipping_address ?? '',
        customFraming: !!i.custom_framing,
        notes: i.message ?? undefined,
        status: (i.status ?? 'new') as Order['status'],
        createdAt: i.created_at,
    };
}

export function mapReviewFromDB(r: any) {
    return {
        id: r.id,
        author: r.author ?? r.author_name,
        message: r.message ?? r.comment,
        rating: r.rating ?? undefined,
        avatarUrl: r.avatar_url ?? undefined,
        image_url: r.image_url ?? undefined,
        isApproved: !!r.is_approved,
        createdAt: r.created_at,
    };
}

export default {};
