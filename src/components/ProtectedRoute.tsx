import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

function FullPageSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                <p className="text-sm text-slate-400">Loading…</p>
            </div>
        </div>
    );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isInitializing } = useAuth();

    // Show a full-screen spinner while Firebase restores the session from
    // persisted state — prevents a flash-of-unauthenticated-content redirect.
    if (isInitializing) return <FullPageSpinner />;

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}
