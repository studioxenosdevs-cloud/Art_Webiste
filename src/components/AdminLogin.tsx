import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Palette, Lock, User, ArrowRight, CircleAlert as AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: username.trim(),
                password,
            });
            setLoading(false);
            if (error) {
                setError(error.message ?? 'Authentication failed.');
                return;
            }
            // On success, Supabase session is active — redirect to admin
            navigate('/admin');
        } catch (err: any) {
            setLoading(false);
            setError(err?.message ?? 'Unexpected error occurred');
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
            {/* Atmospheric background */}
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
            <div className="pointer-events-none absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-violet-300/20 blur-[140px] animate-glow-pulse" />
            <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-violet-400/15 blur-[120px] animate-glow-pulse" style={{ animationDelay: '3s' }} />

            <div className="relative w-full max-w-md">
                {/* Brand */}
                <div className="reveal mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
                        <Palette className="h-8 w-8 text-violet-700" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">Zelbrush Studio</h1>
                    <p className="mt-1 text-sm text-slate-400">Admin Access Required</p>
                </div>

                {/* Login card */}
                <div className="reveal delay-1 glass-card rounded-2xl p-8 shadow-2xl">
                    <div className="mb-6 flex items-center gap-2 text-violet-700">
                        <Lock className="h-5 w-5" />
                        <h2 className="font-display text-lg font-semibold">Secure Login</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <User className="h-4 w-4 text-slate-400" />
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                autoFocus
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <Lock className="h-4 w-4 text-slate-400" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="form-input pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-violet-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600 animate-fade-in">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] hover:scale-[1.02] disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                        <p className="text-xs text-slate-400">Sign in with your Supabase admin email and password.</p>
                    </div>
                </div>

                <div className="reveal delay-2 mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-slate-400 transition-colors hover:text-violet-700"
                    >
                        ← Back to Gallery
                    </button>
                </div>
            </div>
        </div>
    );
}
