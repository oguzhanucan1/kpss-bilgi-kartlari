import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }
    client.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        client.from('profiles').select('role').eq('id', s.user.id).single()
          .then(({ data }) => setProfile(data), () => setProfile(null));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user?.id) {
        client.from('profiles').select('role').eq('id', s.user.id).single()
          .then(({ data }) => setProfile(data), () => setProfile(null));
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'admin';
  return { session, profile, isAdmin, loading };
}
