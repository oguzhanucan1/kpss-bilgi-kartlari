import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { APP_THEME } from '../theme';

type TopicProgress = { topicId: string; topicName: string; viewed: number; total: number; pct: number };

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sn`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return s ? `${m} dk ${s} sn` : `${m} dk`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h} sa ${mm} dk` : `${h} sa`;
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AnalizScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [appSeconds, setAppSeconds] = useState(0);
  const [todaySwipes, setTodaySwipes] = useState(0);
  const [weekSwipes, setWeekSwipes] = useState<{ date: string; count: number }[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [dueTodayCount, setDueTodayCount] = useState(0);

  const load = useCallback(async () => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    const todayKey = formatDateKey(new Date());

    const [viewsRes, sessionsRes, reviewRes, cardsRes, topicsRes] = await Promise.all([
      supabase.from('card_views').select('flash_card_id, viewed_at, duration_seconds').eq('user_id', userId),
      supabase.from('app_sessions').select('started_at, ended_at').eq('user_id', userId),
      supabase.from('card_review_state').select('next_review_at').eq('user_id', userId),
      supabase.from('flash_cards').select('id, topic_id'),
      supabase.from('topics').select('id, name'),
    ]);

    const views = (viewsRes.data ?? []) as { flash_card_id: string; viewed_at: string; duration_seconds: number }[];
    const sessions = (sessionsRes.data ?? []) as { started_at: string; ended_at: string | null }[];
    const reviews = (reviewRes.data ?? []) as { next_review_at: string }[];
    const cards = (cardsRes.data ?? []) as { id: string; topic_id: string }[];
    const topics = (topicsRes.data ?? []) as { id: string; name: string }[];
    const topicMap = Object.fromEntries(topics.map((t) => [t.id, t.name]));

    setTotalViews(views.length);
    const studySec = views.reduce((a, v) => a + (v.duration_seconds || 0), 0);
    setTotalStudySeconds(studySec);

    const now = Date.now();
    let appSec = 0;
    for (const s of sessions) {
      const end = s.ended_at ? new Date(s.ended_at).getTime() : now;
      appSec += (end - new Date(s.started_at).getTime()) / 1000;
    }
    setAppSeconds(appSec);

    const byDate: Record<string, number> = {};
    for (const v of views) {
      const key = formatDateKey(new Date(v.viewed_at));
      byDate[key] = (byDate[key] || 0) + 1;
    }
    setTodaySwipes(byDate[todayKey] ?? 0);

    const week: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      week.push({ date: key, count: byDate[key] ?? 0 });
    }
    setWeekSwipes(week);

    const viewedByTopic: Record<string, Set<string>> = {};
    const totalByTopic: Record<string, number> = {};
    for (const c of cards) {
      totalByTopic[c.topic_id] = (totalByTopic[c.topic_id] || 0) + 1;
      viewedByTopic[c.topic_id] = viewedByTopic[c.topic_id] || new Set();
    }
    for (const v of views) {
      const card = cards.find((c) => c.id === v.flash_card_id);
      if (card?.topic_id) viewedByTopic[card.topic_id].add(v.flash_card_id);
    }
    const progress: TopicProgress[] = Object.entries(totalByTopic).map(([topicId, total]) => ({
      topicId,
      topicName: topicMap[topicId] ?? 'Konu',
      viewed: viewedByTopic[topicId]?.size ?? 0,
      total,
      pct: total ? Math.round(((viewedByTopic[topicId]?.size ?? 0) / total) * 100) : 0,
    }));
    progress.sort((a, b) => b.pct - a.pct);
    setTopicProgress(progress);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const due = reviews.filter((r) => {
      const t = new Date(r.next_review_at).getTime();
      return t >= todayStart.getTime() && t < todayEnd.getTime();
    }).length;
    setDueTodayCount(due);
  }, [userId]);

  useEffect(() => { load().then(() => setLoading(false)); }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (userId) load();
    }, [load, userId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: APP_THEME.background, paddingTop: insets.top + 16 }]}>
        <ActivityIndicator size="large" color={APP_THEME.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background, paddingTop: insets.top + 16 }]}>
      <Text variant="headlineSmall" style={[styles.title, { color: APP_THEME.text }]}>Analiz</Text>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_THEME.primary]} tintColor={APP_THEME.primary} />}
      >
        <View style={[styles.card, { backgroundColor: APP_THEME.cardPastel[0] }]}>
          <MaterialCommunityIcons name="eye-outline" size={24} color={APP_THEME.primary} />
          <View style={styles.cardText}>
            <Text variant="titleMedium" style={styles.cardTitle}>Görüntülenen kart</Text>
            <Text variant="bodyLarge" style={styles.cardValue}>{totalViews}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: APP_THEME.cardPastel[1] }]}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={APP_THEME.primary} />
          <View style={styles.cardText}>
            <Text variant="titleMedium" style={styles.cardTitle}>Kart çalışma süresi</Text>
            <Text variant="bodyLarge" style={styles.cardValue}>{formatDuration(totalStudySeconds)}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: APP_THEME.cardPastel[2] }]}>
          <MaterialCommunityIcons name="cellphone" size={24} color={APP_THEME.primary} />
          <View style={styles.cardText}>
            <Text variant="titleMedium" style={styles.cardTitle}>Uygulamada geçen süre</Text>
            <Text variant="bodyLarge" style={styles.cardValue}>{formatDuration(appSeconds)}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: APP_THEME.cardPastel[3] }]}>
          <MaterialCommunityIcons name="gesture-swipe-horizontal" size={24} color={APP_THEME.primary} />
          <View style={styles.cardText}>
            <Text variant="titleMedium" style={styles.cardTitle}>Bugün kaydırdığınız kart</Text>
            <Text variant="bodyLarge" style={styles.cardValue}>{todaySwipes}</Text>
          </View>
        </View>

        {weekSwipes.length > 0 && (
          <View style={[styles.card, { backgroundColor: APP_THEME.cardPastel[4] }]}>
            <MaterialCommunityIcons name="calendar-week" size={24} color={APP_THEME.primary} />
            <View style={styles.cardText}>
              <Text variant="titleMedium" style={styles.cardTitle}>Son 7 gün (günlük kaydırma)</Text>
              <View style={styles.weekRow}>
                {weekSwipes.map(({ date, count }) => (
                  <View key={date} style={styles.weekCell}>
                    <Text variant="labelSmall" style={styles.weekCount}>{count}</Text>
                    <Text variant="labelSmall" style={styles.weekLabel}>{new Date(date).toLocaleDateString('tr-TR', { weekday: 'narrow' })}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: APP_THEME.surface }]}>
          <MaterialCommunityIcons name="repeat" size={24} color={APP_THEME.primary} />
          <View style={styles.cardText}>
            <Text variant="titleMedium" style={styles.cardTitle}>Bugün tekrar edilecek kart</Text>
            <Text variant="bodyLarge" style={styles.cardValue}>{dueTodayCount}</Text>
          </View>
        </View>

        {topicProgress.length > 0 && (
          <View style={[styles.card, styles.cardBlock, { backgroundColor: APP_THEME.surface }]}>
            <MaterialCommunityIcons name="chart-box-outline" size={24} color={APP_THEME.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, styles.cardBlockTitle]}>Konu bazlı ilerleme</Text>
            {topicProgress.map((t) => (
              <View key={t.topicId} style={styles.progressRow}>
                <Text variant="bodyMedium" style={styles.progressName} numberOfLines={1}>{t.topicName}</Text>
                <Text variant="labelMedium" style={styles.progressPct}>{t.viewed}/{t.total} (%{t.pct})</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: '800', marginBottom: 24, fontSize: 28 },
  scroll: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: APP_THEME.radius.small,
    padding: 16,
    marginBottom: 12,
    ...APP_THEME.shadow.card,
  },
  cardText: { flex: 1, marginLeft: 14 },
  cardTitle: { color: APP_THEME.text, fontWeight: '600', marginBottom: 4 },
  cardValue: { color: APP_THEME.text, fontWeight: '700', fontSize: 18 },
  cardBlock: { flexDirection: 'column', alignItems: 'flex-start' },
  cardBlockTitle: { marginLeft: 0, marginTop: 8, marginBottom: 12 },
  weekRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  weekCell: { alignItems: 'center', minWidth: 36 },
  weekCount: { color: APP_THEME.primary, fontWeight: '700', fontSize: 14 },
  weekLabel: { color: APP_THEME.textMuted2, fontSize: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, width: '100%' },
  progressName: { color: APP_THEME.text, flex: 1, marginRight: 8 },
  progressPct: { color: APP_THEME.textMuted2 },
});
