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

export interface AdminCredentials {
  username: string;
  password: string;
  notificationEmail: string;
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
