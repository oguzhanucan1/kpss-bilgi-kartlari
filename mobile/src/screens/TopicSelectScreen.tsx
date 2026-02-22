import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Searchbar, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useAdSlots } from '../hooks/useAdSlots';
import { AdBannerSlot } from '../components/AdBannerSlot';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

const TOPIC_ICONS = [
  'book-open-page-variant-outline',
  'lightbulb-outline',
  'notebook-outline',
  'school-outline',
  'format-list-bulleted',
  'card-text-outline',
  'brain',
  'chart-box-outline',
] as const;

/** Her kart için gradyan renkleri [sol, sağ] */
const CARD_GRADIENTS: [string, string][] = [
  ['#B8D8C8', '#9BC4B5'],
  ['#C8B8D8', '#B09FC9'],
  ['#B8C8D8', '#9BB5C4'],
  ['#D8D0B8', '#C4BCA8'],
  ['#E8E0F0', '#D4CCE0'],
];

type Topic = { id: string; name: string; slug: string; card_count?: number };
type Props = NativeStackScreenProps<MainStackParamList, 'TopicSelect'>;

export default function TopicSelectScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { subjectId, subjectName } = route.params;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressCount, setProgressCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadTopics = useCallback(async () => {
    if (!supabase) { setTopics([]); setProgressCount(0); return; }
    const { data, error } = await supabase.from('topics').select('id, name, slug').eq('subject_id', subjectId).order('sort_order', { ascending: true });
    if (error) { setTopics([]); setProgressCount(0); return; }
    const list = (data as Topic[]) ?? [];
    const topicIdsInSubject = list.map((t) => t.id);

    const { data: counts } = await supabase.from('flash_cards').select('topic_id');
    if (counts && Array.isArray(counts)) {
      const byTopic: Record<string, number> = {};
      counts.forEach((c: { topic_id: string }) => { byTopic[c.topic_id] = (byTopic[c.topic_id] || 0) + 1; });
      setTopics(list.map((t) => ({ ...t, card_count: byTopic[t.id] ?? 0 })));
    } else { setTopics(list.map((t) => ({ ...t, card_count: 0 }))); }

    if (userId) {
      const { data: views } = await supabase.from('card_views').select('flash_card_id').eq('user_id', userId);
      const flashCardIds = [...new Set((views ?? []).map((v: { flash_card_id: string }) => v.flash_card_id))];
      if (flashCardIds.length > 0) {
        const { data: cards } = await supabase.from('flash_cards').select('id, topic_id').in('id', flashCardIds);
        const viewedInSubject = (cards ?? []).filter((c: { topic_id: string }) => topicIdsInSubject.includes(c.topic_id)).length;
        setProgressCount(viewedInSubject);
      } else {
        setProgressCount(0);
      }
    } else {
      setProgressCount(0);
    }
  }, [subjectId, userId]);

  useEffect(() => { loadTopics().then(() => setLoading(false)); }, [loadTopics]);
  useFocusEffect(useCallback(() => { if (!loading) loadTopics(); }, [loadTopics, loading]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  }, [loadTopics]);

  const adSlots = useAdSlots();
  const totalCards = useMemo(() => topics.reduce((s, t) => s + (t.card_count ?? 0), 0), [topics]);

  const filtered = useMemo(() => {
    if (!search.trim()) return topics;
    return topics.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [topics, search]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={APP_THEME.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={APP_THEME.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{subjectName}</Text>
          <Text style={styles.headerSubtitle}>{topics.length} konu</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_THEME.primary]} tintColor={APP_THEME.primary} />}
      >
        <Searchbar placeholder="Konu ara..." value={search} onChangeText={setSearch} style={styles.search} elevation={0} />

        <View style={styles.progressCard}>
          <View style={[styles.decoCircle, { borderColor: 'rgba(255,255,255,0.25)' }]} />
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Toplam İlerleme</Text>
            <Text style={styles.progressValue}>{progressCount}/{totalCards}</Text>
          </View>
          <ProgressBar progress={totalCards ? progressCount / totalCards : 0} color="#fff" style={styles.progressBar} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.topicCardWrap, styles.mixedCardWrap, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate('Cards', { subjectId, subjectName, topicName: subjectName + ' – Karışık' })}
        >
          <LinearGradient
            colors={['#7C3AED', '#5B21B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topicCard}
          >
            <View style={[styles.cardIconWrap, styles.mixedIconWrap]}>
              <MaterialCommunityIcons name="shuffle-variant" size={26} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.mixedCardTitle]}>Karışık</Text>
              <Text style={styles.mixedCardMeta}>Bu dersin tüm konularından kartlar rastgele – genel tekrar</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </Pressable>

        {filtered.map((topic, index) => {
          const [gradStart, gradEnd] = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
          const iconName = TOPIC_ICONS[index % TOPIC_ICONS.length];
          return (
            <Pressable
              key={topic.id}
              style={({ pressed }) => [styles.topicCardWrap, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('Cards', { topicId: topic.id, topicName: topic.name })}
            >
              <LinearGradient
                colors={[gradStart, gradEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topicCard}
              >
                <View style={styles.cardIconWrap}>
                  <MaterialCommunityIcons name={iconName} size={24} color={APP_THEME.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{topic.name}</Text>
                  <Text style={styles.cardMeta}>{topic.card_count ?? 0} kart</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={APP_THEME.text} />
              </LinearGradient>
            </Pressable>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>Konu bulunamadı</Text>
          </View>
        )}
        <AdBannerSlot slot={adSlots['topic_list_banner']} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_THEME.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  backBtn: { padding: 8, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: APP_THEME.text },
  headerSubtitle: { fontSize: 13, color: APP_THEME.textMuted2, marginTop: 2 },
  scroll: { padding: 20 },
  search: { borderRadius: 14, borderWidth: 1, marginBottom: 16, backgroundColor: APP_THEME.surface, borderColor: APP_THEME.border },
  progressCard: { backgroundColor: APP_THEME.primary, borderRadius: APP_THEME.radius.card, padding: 20, marginBottom: 20, position: 'relative', overflow: 'hidden' },
  decoCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, top: -20, right: -20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 14, color: '#fff', opacity: 0.9 },
  progressValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  topicCardWrap: { marginBottom: 12, borderRadius: APP_THEME.radius.small, ...APP_THEME.shadow.card },
  mixedCardWrap: { marginBottom: 16 },
  mixedIconWrap: { backgroundColor: 'rgba(255,255,255,0.25)' },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: APP_THEME.radius.small,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 72,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  cardIconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardContent: { flex: 1, justifyContent: 'center', minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: APP_THEME.text, lineHeight: 22 },
  cardMeta: { fontSize: 13, fontWeight: '500', color: APP_THEME.textMuted2, marginTop: 2 },
  mixedCardTitle: { color: '#fff', marginBottom: 2 },
  mixedCardMeta: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: APP_THEME.textMuted2, marginTop: 12 },
});
