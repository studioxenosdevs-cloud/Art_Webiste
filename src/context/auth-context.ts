import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AuthContextValue {
    isAuthenticated: boolean;
    isInitializing: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
