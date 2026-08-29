import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AdminCredentials } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
    isAuthenticated: boolean;
    isInitializing: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Get current session
        (async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (e) {
                setUser(null);
            } finally {
                setIsInitializing(false);
            }
        })();

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsInitializing(false);
        });

        const subscription = (data as any)?.subscription;

        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return false;
            setUser(data.user ?? null);
            return true;
        } catch {
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(() => ({ isAuthenticated: !!user, isInitializing, user, login, logout }), [user, isInitializing, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
