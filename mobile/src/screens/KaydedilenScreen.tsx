import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useAdSlots } from '../hooks/useAdSlots';
import { AdBannerSlot } from '../components/AdBannerSlot';
import { APP_THEME } from '../theme';

type SavedRow = {
  id: string;
  flash_card_id: string;
  created_at: string;
  flash_cards: { id: string; content: string; title: string | null; topic_id: string } | null;
};
type TopicMap = Record<string, string>;

export default function KaydedilenScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const navigation = useNavigation<CompositeNavigationProp<BottomTabNavigationProp<any>, NativeStackNavigationProp<any>>>();

  const adSlots = useAdSlots();
  const [list, setList] = useState<SavedRow[]>([]);
  const [topicNames, setTopicNames] = useState<TopicMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!supabase || !userId) { setLoading(false); return; }
    if (!isRefresh) setLoading(true);
    const { data: saved, error: err1 } = await supabase
      .from('saved_cards')
      .select('id, flash_card_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (err1 || !saved || saved.length === 0) {
      setList([]);
      setTopicNames({});
      if (!isRefresh) setLoading(false);
      return;
    }

    const ids = (saved as { flash_card_id: string }[]).map((s) => s.flash_card_id);
    const { data: cards, error: err2 } = await supabase
      .from('flash_cards')
      .select('id, content, title, topic_id')
      .in('id', ids);

    if (err2 || !cards) {
      setList([]);
      if (!isRefresh) setLoading(false);
      return;
    }

    const cardMap = Object.fromEntries((cards as any[]).map((c) => [c.id, c]));
    const rows: SavedRow[] = (saved as any[]).map((s) => ({
      id: s.id,
      flash_card_id: s.flash_card_id,
      created_at: s.created_at,
      flash_cards: cardMap[s.flash_card_id] ?? null,
    }));
    setList(rows);

    const topicIds = [...new Set(rows.map((r) => r.flash_cards?.topic_id).filter(Boolean))] as string[];
    if (topicIds.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id, name').in('id', topicIds);
      const map: TopicMap = {};
      (topics ?? []).forEach((t: { id: string; name: string }) => { map[t.id] = t.name; });
      setTopicNames(map);
    } else {
      setTopicNames({});
    }
    if (!isRefresh) setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    React.useCallback(() => {
      load(true);
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const openTopic = (topicId: string, topicName: string, flashCardId?: string) => {
    navigation.navigate('AnasayfaTab', { screen: 'Cards', params: { topicId, topicName, initialFlashCardId: flashCardId } });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: APP_THEME.background, paddingTop: insets.top + 16 }]}>
        <ActivityIndicator size="large" color={APP_THEME.primary} />
      </View>
    );
  }

  const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_THEME.primary]} tintColor={APP_THEME.primary} />;

  if (list.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: APP_THEME.background, paddingTop: insets.top + 16 }]}>
        <Text variant="headlineSmall" style={[styles.title, { color: APP_THEME.text }]}>Kaydedilenler</Text>
        <ScrollView
          contentContainerStyle={styles.placeholderScroll}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.cardPlaceholder, { backgroundColor: APP_THEME.cardPastel[3] }]}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="bookmark-outline" size={40} color={APP_THEME.primary} />
            </View>
            <Text variant="titleMedium" style={{ color: APP_THEME.text, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>Henüz bir kayıt yok</Text>
            <Text variant="bodyMedium" style={{ color: APP_THEME.textMuted2, textAlign: 'center' }}>Kartları kaydettiğinizde burada görünecek.</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background, paddingTop: insets.top + 16 }]}>
      <Text variant="headlineSmall" style={[styles.title, { color: APP_THEME.text }]}>Kaydedilenler</Text>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {list.map((row) => {
          const fc = row.flash_cards;
          const topicId = fc?.topic_id;
          const topicName = topicId ? topicNames[topicId] ?? 'Konu' : 'Konu';
          const preview = (fc?.content ?? '').slice(0, 100);
          return (
            <Pressable
              key={row.id}
              android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => topicId && openTopic(topicId, topicName, row.flash_card_id)}
            >
              <View style={styles.cardHeader}>
                <Text variant="labelMedium" style={styles.topicLabel}>{topicName}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={APP_THEME.textMuted2} />
              </View>
              <Text variant="bodyMedium" style={styles.preview} numberOfLines={2}>{preview || '—'}</Text>
            </Pressable>
          );
        })}
        <AdBannerSlot slot={adSlots['saved_banner']} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: '800', marginBottom: 24, fontSize: 28 },
  scroll: { paddingBottom: 24 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  placeholderScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  cardPlaceholder: { borderRadius: APP_THEME.radius.card, padding: 32, alignItems: 'center', minWidth: '100%', ...APP_THEME.shadow.card },
  iconWrap: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: APP_THEME.surface, marginBottom: 20, ...APP_THEME.shadow.card },
  card: { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.small, padding: 16, marginBottom: 12, ...APP_THEME.shadow.card },
  cardPressed: { opacity: 0.95 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  topicLabel: { color: APP_THEME.primary, fontWeight: '600', fontSize: 13 },
  preview: { color: APP_THEME.text, lineHeight: 22 },
});
