import type { Artwork, Order, TimelineEvent } from '@/types';

// ---------------------------------------------------------------------------
// Firestore record type
// ---------------------------------------------------------------------------
export type FirestoreRecord = Record<string, unknown> & { id: string };

// ---------------------------------------------------------------------------
// Public Review type
// ---------------------------------------------------------------------------
export interface Review {
    id: string;
    author: string;
    message: string;
    rating?: number;
    avatarUrl?: string;
    image_url?: string;
    isApproved: boolean;
    createdAt: string;
}

// ---------------------------------------------------------------------------
// Default Timeline milestones used when collection is empty
// ---------------------------------------------------------------------------
export const DEFAULT_TIMELINE_STEPS: Omit<TimelineEvent, 'id'>[] = [
    {
        order: 1,
        stepNumber: '01',
        title: 'Concept & Spiritual Sketch',
        subtitle: 'Vision & Sacred Geometry',
        description: 'Every piece begins with a dialogue. We explore the sacred verses, emotional resonance, and space palette — translating devotion into balanced sketches.',
        badge: 'Phase 1 · Ideation',
        accent: 'from-violet-100 to-violet-200/50',
        iconName: 'PencilRuler',
    },
    {
        order: 2,
        stepNumber: '02',
        title: 'Handcrafted Painting & 24k Gold Leafing',
        subtitle: 'Devotional Craftsmanship',
        description: 'The sketch comes alive through layered archival acrylics, Sufi textured strokes, and illumination with genuine 24k gold leaf applied with surgical precision.',
        badge: 'Phase 2 · Masterwork',
        accent: 'from-amber-100 to-amber-200/50',
        iconName: 'Brush',
    },
    {
        order: 3,
        stepNumber: '03',
        title: 'Museum-Grade Framing & Curation',
        subtitle: 'Preservation & Elegance',
        description: 'Completed masterworks receive protective archival UV isolation coats and are set into bespoke handcrafted floating frames tailored to highlight each silhouette.',
        badge: 'Phase 3 · Framing',
        accent: 'from-violet-200/60 to-violet-300/40',
        iconName: 'Frame',
    },
    {
        order: 4,
        stepNumber: '04',
        title: 'Insured White-Glove Global Delivery',
        subtitle: 'To Your Sacred Space',
        description: 'Packaged in custom reinforced timber crates with humidity resistance, dispatched worldwide with tracked white-glove courier and signed authenticity seal.',
        badge: 'Phase 4 · Delivery',
        accent: 'from-emerald-100 to-emerald-200/50',
        iconName: 'Sparkles',
    },
];

// ---------------------------------------------------------------------------
// Mapper helpers — Firestore doc → app domain types
// ---------------------------------------------------------------------------

export function mapArtworkFromDB(data: FirestoreRecord): Artwork {
    return {
        id: data.id,
        title: String(data.title ?? ''),
        category: (data.category as Artwork['category']) ?? 'sufi',
        medium: String(data.medium ?? ''),
        dimensions: String(data.dimensions ?? ''),
        pricePKR: Number(data.pricePKR ?? data.price ?? data.price_pkr ?? 0),
        status: (data.status as Artwork['status']) ?? 'available',
        imageUrl: String(data.imageUrl ?? data.image_url ?? ''),
        description: data.description ? String(data.description) : '',
    };
}

export function mapInquiryFromDB(data: FirestoreRecord): Order {
    const artworks = data.artworks as { title?: string } | undefined;
    return {
        id: data.id,
        artworkId: String(data.artworkId ?? data.artwork_id ?? ''),
        artworkTitle: String(data.artworkTitle ?? artworks?.title ?? ''),
        customerName: String(data.customerName ?? data.customer_name ?? ''),
        email: data.email ? String(data.email) : undefined,
        phone: String(data.phone ?? ''),
        shippingAddress: String(data.shippingAddress ?? data.shipping_address ?? ''),
        customFraming: Boolean(data.customFraming ?? data.custom_framing),
        notes: data.notes ? String(data.notes) : (data.message ? String(data.message) : undefined),
        status: (data.status as Order['status']) ?? 'new',
        createdAt: String(data.createdAt ?? data.created_at ?? new Date().toISOString()),
    };
}

export function mapReviewFromDB(data: FirestoreRecord): Review {
    return {
        id: data.id,
        author: String(data.author ?? data.author_name ?? ''),
        message: String(data.message ?? data.comment ?? ''),
        rating: data.rating != null ? Number(data.rating) : undefined,
        avatarUrl: data.avatarUrl ? String(data.avatarUrl) : (data.avatar_url ? String(data.avatar_url) : undefined),
        image_url: data.imageUrl ? String(data.imageUrl) : (data.image_url ? String(data.image_url) : undefined),
        isApproved: Boolean(data.isApproved ?? data.is_approved),
        createdAt: String(data.createdAt ?? data.created_at ?? new Date().toISOString()),
    };
}

export function mapTimelineFromDB(data: FirestoreRecord): TimelineEvent {
    return {
        id: data.id,
        order: Number(data.order ?? 0),
        stepNumber: String(data.stepNumber ?? data.step_number ?? '01'),
        title: String(data.title ?? ''),
        subtitle: data.subtitle ? String(data.subtitle) : '',
        description: String(data.description ?? ''),
        badge: data.badge ? String(data.badge) : '',
        accent: data.accent ? String(data.accent) : 'from-violet-100 to-violet-200/50',
        iconName: data.iconName ? String(data.iconName) : 'Sparkles',
        imageUrl: data.imageUrl ? String(data.imageUrl) : (data.image_url ? String(data.image_url) : ''),
    };
}

// Firestore snapshot doc → plain object with id
export function recordsFromSnapshot(snapshot: {
    docs: Array<{ id: string; data: () => Record<string, unknown> }>;
}): FirestoreRecord[] {
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
