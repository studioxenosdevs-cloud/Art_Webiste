import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Check active session on mount
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                setIsInitializing(false);
            })
            .catch((err) => {
                console.error('Error fetching Supabase session:', err);
                setIsInitializing(false);
            });

        // Listen to auth state transitions
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsInitializing(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error || !data.user) {
                return false;
            }
            setUser(data.user);
            return true;
        } catch {
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Supabase sign out error:', err);
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ isAuthenticated: !!user, isInitializing, user, login, logout }),
        [user, isInitializing, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
