import type { Artwork, ArtworkRow, InquiryRow, Order, ReviewRow, TimelineEvent, TimelineRow } from '@/types';

// ---------------------------------------------------------------------------
// Database record type
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Public Review type
// ---------------------------------------------------------------------------
export interface Review {
    id: string;
    author: string;
    message: string;
    rating?: number;
    avatarUrl?: string;
    imageUrl?: string;
    isApproved: boolean;
    createdAt: string;
}

// ---------------------------------------------------------------------------
// Default Timeline milestones used when table is empty
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
// Mapper helpers — Database row → app domain types
// ---------------------------------------------------------------------------

export function mapArtworkFromDB(data: ArtworkRow): Artwork {
    return {
        id: String(data.id),
        title: String(data.title ?? ''),
        category: (data.category as Artwork['category']) ?? 'sufi',
        medium: String(data.medium ?? ''),
        dimensions: String(data.dimensions ?? ''),
        pricePKR: data.price_pkr,
        status: (data.status as Artwork['status']) ?? 'available',
        imageUrl: data.image_url,
        description: data.description,
    };
}

export function mapInquiryFromDB(data: InquiryRow): Order {
    // Older projects used values such as "pending" or "in_progress". The UI
    // only supports these three states, so safely normalize legacy values.
    const status = data.status === 'contacted' || data.status === 'completed' ? data.status : 'new';
    return {
        id: String(data.id),
        artworkId: data.artwork_id ?? '',
        artworkTitle: data.artwork_title,
        customerName: data.customer_name,
        email: data.email ?? undefined,
        phone: data.phone,
        shippingAddress: data.shipping_address,
        customFraming: data.custom_framing,
        notes: data.notes ?? undefined,
        status,
        createdAt: data.created_at,
    };
}

export function mapReviewFromDB(data: ReviewRow): Review {
    return {
        id: String(data.id),
        author: data.author_name,
        message: data.comment,
        rating: data.rating,
        avatarUrl: data.avatar_url ?? undefined,
        imageUrl: data.image_url ?? undefined,
        isApproved: data.is_approved,
        createdAt: data.created_at,
    };
}

export function mapTimelineFromDB(data: TimelineRow): TimelineEvent {
    return {
        id: String(data.id),
        order: data.sort_order,
        stepNumber: data.step_number,
        title: data.title,
        subtitle: data.subtitle ?? '',
        description: data.description,
        badge: data.badge ?? '',
        accent: data.accent ?? 'from-violet-100 to-violet-200/50',
        iconName: data.icon_name ?? 'Sparkles',
        imageUrl: data.image_url ?? '',
    };
}
