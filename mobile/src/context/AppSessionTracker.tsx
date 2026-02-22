import React, { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Uygulama ön plana/arkaya geçtiğinde app_sessions kaydı oluşturur ve günceller.
 */
export default function AppSessionTracker() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const currentSessionIdRef = useRef<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!supabase || !userId) return;

    const handleStateChange = (nextState: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (prev === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        if (currentSessionIdRef.current) {
          supabase
            .from('app_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', currentSessionIdRef.current)
            .then(() => { currentSessionIdRef.current = null; });
        }
      } else if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        supabase
          .from('app_sessions')
          .insert({ user_id: userId, started_at: new Date().toISOString() })
          .select('id')
          .single()
          .then(({ data }) => {
            if (data?.id) currentSessionIdRef.current = data.id;
          });
      }
    };

    if (AppState.currentState === 'active') {
      supabase
        .from('app_sessions')
        .insert({ user_id: userId, started_at: new Date().toISOString() })
        .select('id')
        .single()
        .then(({ data }) => {
          if (data?.id) currentSessionIdRef.current = data.id;
        });
    }

    const sub = AppState.addEventListener('change', handleStateChange);
    return () => {
      if (currentSessionIdRef.current) {
        supabase
          .from('app_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', currentSessionIdRef.current)
          .then(() => {});
      }
      sub.remove();
    };
  }, [userId]);

  return null;
}
