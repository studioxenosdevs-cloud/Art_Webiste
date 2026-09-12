import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
            setUser(nextUser);
            setIsInitializing(false);
        });
        return unsubscribe;
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            setUser(credential.user);
            return !!credential.user;
        } catch {
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ isAuthenticated: !!user, isInitializing, user, login, logout }),
        [user, isInitializing, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
