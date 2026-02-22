import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function useUnreadNotificationsCount(): { count: number; refresh: () => Promise<void> } {
  const { session } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!supabase || !session?.user?.id) {
      setCount(0);
      return;
    }
    const [logsRes, readRes] = await Promise.all([
      supabase.from('push_logs').select('id'),
      supabase.from('user_notification_read').select('push_log_id').eq('user_id', session.user.id),
    ]);
    const total = (logsRes.data ?? []).length;
    const readIds = new Set((readRes.data ?? []).map((r: { push_log_id: string }) => r.push_log_id));
    setCount(Math.max(0, total - readIds.size));
  }, [session?.user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { count, refresh };
}
