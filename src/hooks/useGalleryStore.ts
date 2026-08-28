import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import artworksSeed from '@/data/artworks.json';
import inquiriesSeed from '@/data/inquiries.json';
import type { Artwork, Order } from '@/types';

const ARTWORKS_KEY = 'zel_brush_artworks';
const ORDERS_KEY = 'zel_brush_orders';

export function useGalleryStore() {
  const [artworks, setArtworks] = useLocalStorage<Artwork[]>(ARTWORKS_KEY, artworksSeed as Artwork[]);
  const [orders, setOrders] = useLocalStorage<Order[]>(ORDERS_KEY, inquiriesSeed as Order[]);

  const addArtwork = useCallback(
    (art: Omit<Artwork, 'id'>) => {
      const id = `art-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      setArtworks((prev) => [{ ...art, id }, ...prev]);
      return id;
    },
    [setArtworks]
  );

  const updateArtwork = useCallback(
    (id: string, patch: Partial<Artwork>) => {
      setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [setArtworks]
  );

  const deleteArtwork = useCallback(
    (id: string) => {
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    },
    [setArtworks]
  );

  const toggleArtworkStatus = useCallback(
    (id: string) => {
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: a.status === 'available' ? 'sold' : 'available' } : a
        )
      );
    },
    [setArtworks]
  );

  const addOrder = useCallback(
    (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
      const id = `inq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newOrder: Order = { ...order, id, status: 'new', createdAt: new Date().toISOString() };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    [setOrders]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: Order['status']) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    [setOrders]
  );

  const deleteOrder = useCallback(
    (id: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    },
    [setOrders]
  );

  return {
    artworks,
    orders,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    toggleArtworkStatus,
    addOrder,
    updateOrderStatus,
    deleteOrder,
  };
}
