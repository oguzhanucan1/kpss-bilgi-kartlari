import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type ProfileData = {
  username: string;
  full_name?: string;
  hedef_yil?: string;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isSetupComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isSetupCompleteFromSession(session: Session | null): boolean {
  if (!session?.user?.user_metadata) return false;
  return session.user.user_metadata.setup_completed === true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!supabase) return;
    const { data: { session: s } } = await supabase.auth.getSession();
    setSession(s);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase ayarlanmadı') };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: new Error('Supabase ayarlanmadı') };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error ?? null };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const updateProfile = async (data: ProfileData) => {
    if (!supabase?.auth || !session?.user) return { error: new Error('Supabase ayarlanmadı') };
    const username = data.username.trim().toLowerCase();
    if (!username) return { error: new Error('Kullanıcı adı gerekli') };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: session.user.id,
          username,
          full_name: data.full_name?.trim() || null,
          hedef_yil: data.hedef_yil?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      if (profileError.code === '23505') return { error: new Error('Bu kullanıcı adı zaten kullanılıyor.') };
      return { error: profileError ?? null };
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { setup_completed: true },
    });
    if (!metaError) await refreshSession();
    return { error: metaError ?? null };
  };

  const isSetupComplete = isSetupCompleteFromSession(session);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isSetupComplete,
        signIn,
        signUp,
        signOut,
        refreshSession,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
