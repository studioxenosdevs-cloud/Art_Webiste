import { useCallback, useRef, useState } from 'react';
import Hero from '@/components/Hero';
import Showcase from '@/components/Showcase';
import CommissionSection from '@/components/CommissionSection';
import ArtistJourney from '@/components/ArtistJourney';
import Testimonials from '@/components/Testimonials';
import Lightbox from '@/components/Lightbox';
import InquiryDrawer from '@/components/InquiryDrawer';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { useGalleryStore } from '@/hooks/useGalleryStore';
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
        <Showcase artworks={store.artworks} onOpenLightbox={setLightboxArt} onInquire={handleInquire} />
      </div>

      <div ref={commissionRef}>
        <CommissionSection onRequestCommission={() => handleInquire(COMMISSION_ARTWORK)} />
      </div>

      <ArtistJourney />
      <Testimonials />
      <Footer onCommission={scrollToCommission} onBackToTop={backToTop} />

      <Lightbox art={lightboxArt} list={store.artworks} onClose={() => setLightboxArt(null)} onNavigate={setLightboxArt} onInquire={handleInquire} />
      <InquiryDrawer artwork={inquiryArt} onClose={() => setInquiryArt(null)} onSubmit={handleOrderSubmit} />
      <Toast show={toast.show} message={toast.message} submessage={toast.submessage} onClose={() => setToast((t) => ({ ...t, show: false }))} />
    </main>
  );
}
