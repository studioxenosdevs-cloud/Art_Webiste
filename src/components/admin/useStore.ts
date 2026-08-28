import { useOutletContext } from 'react-router-dom';
import { useGalleryStore } from '@/hooks/useGalleryStore';

export function useStore() {
  return useOutletContext<ReturnType<typeof useGalleryStore>>();
}
