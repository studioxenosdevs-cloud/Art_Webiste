import { useCallback, useRef, useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import Showcase from '@/components/Showcase';
import ReviewMarquee from '@/components/ReviewMarquee';
import CommissionSection from '@/components/CommissionSection';
import ArtistJourney from '@/components/ArtistJourney';
import Testimonials from '@/components/Testimonials';
import Lightbox from '@/components/Lightbox';
import InquiryDrawer from '@/components/InquiryDrawer';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { useGalleryStore } from '@/hooks/useGalleryStore';
import { supabase } from '@/lib/supabase';
import type { Artwork, Order } from '@/types';

const COMMISSION_ARTWORK: Artwork = {
    id: 'commission',
    title: 'Custom Commission Piece',
    category: 'custom',
    medium: 'Custom Medium',
    dimensions: 'Custom Size',
    pricePKR: 0,
    status: 'available',
    imageUrl: '',
    description: 'A bespoke artwork created to your specifications.',
};

export default function GalleryPage() {
    const store = useGalleryStore();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);

    const fetchInitial = useCallback(async () => {
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) return;
        setArtworks((data ?? []).map((a: any) => ({ id: a.id, title: a.title, category: a.category, medium: a.medium, dimensions: a.dimensions, pricePKR: a.price_pkr, status: a.status, imageUrl: a.image_url, description: a.description ?? undefined })));
        const last = (data ?? []).length ? (data ?? [])[(data ?? []).length - 1].created_at : null;
        setLastCreatedAt(last ?? null);
        setHasMore((data ?? []).length === 10);
    }, []);

    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    const loadMore = useCallback(async () => {
        if (!artworks.length) return;
        setLoadingMore(true);
        const last = artworks[artworks.length - 1];
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false })
            .lt('created_at', lastCreatedAt ?? undefined)
            .limit(10);
        if (error) {
            setLoadingMore(false);
            return;
        }
        const mapped = (data ?? []).map((a: any) => ({ id: a.id, title: a.title, category: a.category, medium: a.medium, dimensions: a.dimensions, pricePKR: a.price_pkr, status: a.status, imageUrl: a.image_url, description: a.description ?? undefined }));
        setArtworks((prev) => [...prev, ...mapped]);
        const last2 = (data ?? []).length ? (data ?? [])[(data ?? []).length - 1].created_at : null;
        setLastCreatedAt(last2 ?? null);
        setHasMore((data ?? []).length === 10);
        setLoadingMore(false);
    }, [artworks]);
    const [lightboxArt, setLightboxArt] = useState<Artwork | null>(null);
    const [inquiryArt, setInquiryArt] = useState<Artwork | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; submessage?: string }>({ show: false, message: '' });
    const showcaseRef = useRef<HTMLDivElement>(null);
    const commissionRef = useRef<HTMLDivElement>(null);

    const scrollToShowcase = useCallback(() => {
        requestAnimationFrame(() => { showcaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }, []);

    const scrollToCommission = useCallback(() => {
        requestAnimationFrame(() => { commissionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }, []);

    const backToTop = useCallback(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

    const handleInquire = useCallback((art: Artwork) => { setInquiryArt(art); }, []);

    const handleOrderSubmit = useCallback(
        (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
            store.addOrder(order);
            setToast({
                show: true,
                message: order.artworkId === 'commission' ? 'Commission Request Submitted!' : 'Order Inquiry Submitted!',
                submessage: 'Instant email notification dispatched to Zelbrush',
            });
        },
        [store]
    );

    return (
        <main>
            <Hero onViewShowcase={scrollToShowcase} onCommission={scrollToCommission} />

            <div ref={showcaseRef}>
                <Showcase artworks={artworks} onOpenLightbox={setLightboxArt} onInquire={handleInquire} />
                <ReviewMarquee />
                {hasMore && (
                    <div className="mt-6 text-center">
                        <button onClick={loadMore} disabled={loadingMore} className="rounded-lg bg-violet-600 text-white px-4 py-2">
                            {loadingMore ? 'Loading…' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>

            <div ref={commissionRef}>
                <CommissionSection onRequestCommission={() => handleInquire(COMMISSION_ARTWORK)} />
            </div>

            <ArtistJourney />
            <Testimonials />
            <Footer onCommission={scrollToCommission} onBackToTop={backToTop} />

            <Lightbox art={lightboxArt} list={artworks} onClose={() => setLightboxArt(null)} onNavigate={setLightboxArt} onInquire={handleInquire} />
            <InquiryDrawer artwork={inquiryArt} onClose={() => setInquiryArt(null)} onSubmit={handleOrderSubmit} />
            <Toast show={toast.show} message={toast.message} submessage={toast.submessage} onClose={() => setToast((t) => ({ ...t, show: false }))} />
        </main>
    );
}
