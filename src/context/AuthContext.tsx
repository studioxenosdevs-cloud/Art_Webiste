import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import adminCreds from '@/data/adminCredentials.json';
import type { AdminCredentials } from '@/types';

const AUTH_TOKEN_KEY = 'zel_brush_admin_token';
const CREDENTIALS_KEY = 'zel_brush_admin_credentials';

interface AuthContextValue {
  isAuthenticated: boolean;
  credentials: AdminCredentials;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (patch: Partial<AdminCredentials>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useLocalStorage<AdminCredentials>(
    CREDENTIALS_KEY,
    adminCreds as AdminCredentials
  );
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const login = useCallback(
    (username: string, password: string): boolean => {
      if (username === credentials.username && password === credentials.password) {
        const mockToken = btoa(`${username}:${Date.now()}`);
        try {
          localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        } catch {
          /* ignore */
        }
        setToken(mockToken);
        return true;
      }
      return false;
    },
    [credentials]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
  }, []);

  const updateCredentials = useCallback(
    (patch: Partial<AdminCredentials>) => {
      setCredentials((prev) => ({ ...prev, ...patch }));
    },
    [setCredentials]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!token,
      credentials,
      login,
      logout,
      updateCredentials,
    }),
    [token, credentials, login, logout, updateCredentials]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-export for ProtectedRoute convenience
export { AUTH_TOKEN_KEY };
