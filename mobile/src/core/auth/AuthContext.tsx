import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from './types';
import { setUser as persistUser, clearSession } from '../storage/storage';
import { findMockUser, mockUserToUser } from './mockUsers';
import { fetchProfile } from './profile';
import { isSupabaseConfigured, supabase } from '../supabase/client';

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

  const applySession = useCallback(async (accessToken: string | null, userId: string | null) => {
    if (!accessToken || !userId) {
      setTokenState(null);
      setUserState(null);
      return;
    }

    const profile = await fetchProfile(userId);
    if (!profile || !profile.ativo) {
      setTokenState(null);
      setUserState(null);
      await clearSession();
      return;
    }

    setTokenState(accessToken);
    setUserState(profile);
    await persistUser(profile);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session?.access_token ?? null, session?.user?.id ?? null).finally(() =>
        setIsLoading(false)
      );
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.access_token ?? null, session?.user?.id ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [applySession]);

  const login = useCallback(async (email: string, senha: string) => {
    if (!isSupabaseConfigured) {
      const found = findMockUser(email, senha);
      if (!found) {
        return { success: false, error: 'E-mail ou senha inválidos.' };
      }
      const userData = mockUserToUser(found);
      const mockToken = `mock-token-${userData.id}`;
      await persistUser(userData);
      setTokenState(mockToken);
      setUserState(userData);
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      return { success: false, error: 'E-mail ou senha inválidos.' };
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile?.ativo) {
      await supabase.auth.signOut();
      return { success: false, error: 'Usuário inativo ou sem perfil.' };
    }

    setTokenState(data.session?.access_token ?? null);
    setUserState(profile);
    await persistUser(profile);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
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
