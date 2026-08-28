import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCallback } from 'react';
import Header from '@/components/Header';
import GalleryPage from '@/components/GalleryPage';
import AdminLogin from '@/components/AdminLogin';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Overview from '@/components/admin/Overview';
import ArtworkManager from '@/components/admin/ArtworkManager';
import Inquiries from '@/components/admin/Inquiries';
import Settings from '@/components/admin/Settings';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';

function PublicLayout() {
  const scrollToShowcase = useCallback((category?: string) => {
    const el = document.getElementById('showcase');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (category) {
      window.dispatchEvent(new CustomEvent('filterCategory', { detail: category }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header onScrollToShowcase={scrollToShowcase} />
      <GalleryPage />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route element={<AdminDashboard />}>
              <Route index element={<Overview />} />
              <Route path="artworks" element={<ArtworkManager />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}