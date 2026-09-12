export type ArtCategory = 'sufi' | 'calligraphy' | 'nature' | 'custom';

export type ArtStatus = 'available' | 'sold';

export type InquiryStatus = 'new' | 'contacted' | 'completed';

export interface Artwork {
    id: string;
    title: string;
    category: ArtCategory;
    medium: string;
    dimensions: string;
    pricePKR: number;
    status: ArtStatus;
    imageUrl: string;
    description?: string;
}


export type GalleryItem = Artwork;

export interface Order {
    id: string;
    artworkId: string;
    artworkTitle: string;
    customerName: string;
    email?: string;
    phone: string;
    shippingAddress: string;
    customFraming: boolean;
    notes?: string;
    status: InquiryStatus;
    createdAt: string;
}

export interface TimelineEvent {
    id: string;
    stepNumber: string;
    order: number;
    title: string;
    subtitle?: string;
    description: string;
    badge?: string;
    accent?: string;
    iconName?: string;
    imageUrl?: string;
}

/** Database rows deliberately retain Supabase's snake_case column names. */
export interface ArtworkRow { id: string; title: string; description: string; category: ArtCategory; medium: string; dimensions: string; price_pkr: number; status: ArtStatus; image_url: string; created_at: string; updated_at: string; }
export interface InquiryRow { id: string; artwork_id: string | null; artwork_title: string; customer_name: string; email: string | null; phone: string; shipping_address: string; custom_framing: boolean; notes: string | null; status: InquiryStatus; created_at: string; updated_at: string; }
export interface ReviewRow { id: string; author_name: string; comment: string; rating: number; avatar_url: string | null; image_url: string | null; is_approved: boolean; created_at: string; updated_at?: string; }
export interface TimelineRow { id: string; step_number: string; sort_order: number; title: string; subtitle: string | null; description: string; badge: string | null; accent: string | null; icon_name: string | null; image_url: string | null; created_at: string; updated_at: string; }
export interface SettingsRow { id: string; notification_email: string | null; created_at: string; updated_at: string; }

export interface UserSession {
    id: string;
    email: string | null;
    displayName: string | null;
}

export const CANVAS_SIZES = [
    '12 × 12 inches',
    '12 × 18 inches',
    '18 × 18 inches',
    '18 × 24 inches',
    '24 × 24 inches',
    '30 × 30 inches',
    '24 × 36 inches',
] as const;

export type CanvasSize = (typeof CANVAS_SIZES)[number];
