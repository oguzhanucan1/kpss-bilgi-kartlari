import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, IconButton, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type PushLog = { id: string; title: string; body: string | null; sent_at: string };
type ReadSet = Set<string>;

type Props = NativeStackScreenProps<MainStackParamList, 'BildirimListesi'>;

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function BildirimListesiScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [readSet, setReadSet] = useState<ReadSet>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase || !session?.user?.id) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [logsRes, readRes] = await Promise.all([
      supabase.from('push_logs').select('id, title, body, sent_at').order('sent_at', { ascending: false }),
      supabase.from('user_notification_read').select('push_log_id').eq('user_id', session.user.id),
    ]);
    setLogs((logsRes.data as PushLog[]) ?? []);
    setReadSet(new Set((readRes.data ?? []).map((r: { push_log_id: string }) => r.push_log_id)));
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (!supabase || !session?.user?.id) return;
      const markAllRead = async () => {
        const { data: existing } = await supabase
          .from('user_notification_read')
          .select('push_log_id')
          .eq('user_id', session.user!.id);
        const existingIds = new Set((existing ?? []).map((r: { push_log_id: string }) => r.push_log_id));
        const { data: allLogs } = await supabase.from('push_logs').select('id');
        const toInsert = (allLogs ?? [])
          .filter((l: { id: string }) => !existingIds.has(l.id))
          .map((l: { id: string }) => ({ user_id: session.user!.id, push_log_id: l.id }));
        if (toInsert.length > 0) {
          await supabase.from('user_notification_read').upsert(toInsert, { onConflict: 'user_id,push_log_id' });
        }
      };
      markAllRead().then(() => load());
    }, [session?.user?.id, load])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} iconColor={APP_THEME.text} />
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <View style={styles.headerRight} />
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={APP_THEME.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bell-outline" size={48} color={APP_THEME.textMuted2} />
              <Text style={styles.emptyText}>Henüz bildirim yok.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {logs.map((item, index) => (
                <List.Item
                  key={item.id}
                  title={item.title}
                  description={item.body ? `${item.body}\n${formatDate(item.sent_at)}` : formatDate(item.sent_at)}
                  titleStyle={styles.itemTitle}
                  descriptionStyle={styles.itemDesc}
                  descriptionNumberOfLines={4}
                  left={(p) => (
                    <View style={[styles.iconWrap, !readSet.has(item.id) && styles.iconWrapUnread]}>
                      <List.Icon {...p} icon="bell-outline" color={readSet.has(item.id) ? APP_THEME.textMuted2 : APP_THEME.primary} />
                    </View>
                  )}
                  style={[styles.item, index === logs.length - 1 && styles.itemLast]}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: APP_THEME.text },
  headerRight: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: APP_THEME.textMuted2, marginTop: 12 },
  list: { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, overflow: 'hidden', borderWidth: 1, borderColor: APP_THEME.border },
  item: { borderBottomWidth: 1, borderBottomColor: APP_THEME.border },
  itemLast: { borderBottomWidth: 0 },
  itemTitle: { fontWeight: '600', color: APP_THEME.text },
  itemDesc: { color: APP_THEME.textMuted2, marginTop: 4 },
  iconWrap: { marginRight: 0 },
  iconWrapUnread: {},
});
