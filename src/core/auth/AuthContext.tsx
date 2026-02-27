import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from './types';
import { getToken, getUser, setToken, setUser, clearSession } from '../storage/storage';
import { findMockUser, mockUserToUser } from './mockUsers';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([getToken(), getUser()]);
      setTokenState(storedToken);
      setUserState(storedUser);
    } catch {
      setTokenState(null);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (email: string, senha: string) => {
    const found = findMockUser(email, senha);
    if (!found) {
      return { success: false, error: 'E-mail ou senha inválidos.' };
    }
    const userData = mockUserToUser(found);
    const mockToken = `mock-token-${userData.id}`;
    await setToken(mockToken);
    await setUser(userData);
    setTokenState(mockToken);
    setUserState(userData);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setTokenState(null);
    setUserState(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
