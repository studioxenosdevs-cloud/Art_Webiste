import { Outlet } from 'react-router-dom';
import { useGalleryStore } from '@/hooks/useGalleryStore';

export default function AdminDashboard() {
  const store = useGalleryStore();

  return <Outlet context={store} />;
}
