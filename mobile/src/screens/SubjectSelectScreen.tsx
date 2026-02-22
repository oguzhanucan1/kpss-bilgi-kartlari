import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useAdSlots } from '../hooks/useAdSlots';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { AdBannerSlot } from '../components/AdBannerSlot';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';

type Subject = { id: string; name: string; slug: string; icon_emoji?: string };
type Props = NativeStackScreenProps<MainStackParamList, 'SubjectSelect'>;

type CardTheme = { bg: string; icon: string; iconBg: string };
const CARD_THEMES: CardTheme[] = [
  { bg: '#B8D8C8', icon: 'clock-outline', iconBg: '#fff' },
  { bg: '#C8B8D8', icon: 'earth', iconBg: '#fff' },
  { bg: '#B8C8D8', icon: 'scale-balance', iconBg: '#fff' },
  { bg: '#D8D0B8', icon: 'book-open-variant', iconBg: '#fff' },
];

function getCardTheme(name: string, slug: string, i: number): CardTheme {
  const n = (name + slug).toLowerCase().replace(/[ğışöüç]/g, (c) => ({ ğ: 'g', ı: 'i', ş: 's', ö: 'o', ü: 'u', ç: 'c' }[c] || c));
  if (n.includes('tarih')) return CARD_THEMES[0];
  if (n.includes('cografya')) return CARD_THEMES[1];
  if (n.includes('vatandaslik')) return CARD_THEMES[2];
  if (n.includes('turkce')) return CARD_THEMES[3];
  return CARD_THEMES[i % CARD_THEMES.length];
}

const DEMO: Subject[] = [
  { id: '1', name: 'Tarih', slug: 'tarih' },
  { id: '2', name: 'Coğrafya', slug: 'cografya' },
  { id: '3', name: 'Vatandaşlık', slug: 'vatandaslik' },
  { id: '4', name: 'Türkçe', slug: 'turkce' },
];
const DEMO_P: Record<string, { done: number; total: number }> = {
  '1': { done: 24, total: 45 }, '2': { done: 12, total: 30 }, '3': { done: 0, total: 15 }, '4': { done: 32, total: 32 },
};

const { width } = Dimensions.get('window');
const PAD = 20;
const GAP = 12;
const CARD_WIDTH = (width - PAD * 2 - GAP) / 2;

const DEFAULT_QUOTE = 'Başarı, küçük çabaların günlük tekrarıdır.';

type Announcement = { id: string; title: string; excerpt: string | null; created_at: string };

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
function formatDuyuruDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
}

export default function SubjectSelectScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quote, setQuote] = useState(DEFAULT_QUOTE);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const adSlots = useAdSlots();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const name = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Kullanıcı';
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const loadSubjects = React.useCallback(async () => {
    if (!supabase) { setSubjects(DEMO); setAnnouncements([]); return; }
    try {
      const { data, error } = await supabase.from('subjects').select('id, name, slug, icon_emoji').order('sort_order', { ascending: true });
      setSubjects(error || !(data as Subject[])?.length ? DEMO : (data as Subject[]));
    } catch (_) {
      setSubjects(DEMO);
    }
    try {
      const { data: quotesData } = await supabase.from('motivation_quotes').select('text').eq('is_active', true).order('sort_order', { ascending: true });
      const quotes = (quotesData as { text: string }[] | null)?.map((q) => q.text).filter(Boolean) ?? [];
      setQuote(quotes.length ? quotes[Math.floor(Math.random() * quotes.length)] : DEFAULT_QUOTE);
    } catch (_) {
      setQuote(DEFAULT_QUOTE);
    }
    try {
      const { data: annData } = await supabase.from('announcements').select('id, title, excerpt, created_at').eq('is_active', true).order('created_at', { ascending: false }).limit(10);
      setAnnouncements((annData as Announcement[] | null) ?? []);
    } catch (_) {
      setAnnouncements([]);
    }
  }, []);

  useEffect(() => { loadSubjects().then(() => setLoading(false)); }, [loadSubjects]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  }, [loadSubjects]);

  const goToProfil = () => {
    (navigation.getParent() as any)?.navigate('Profil');
  };

  const totalDone = Object.values(DEMO_P).reduce((a, b) => a + b.done, 0);
  const totalAll = Object.values(DEMO_P).reduce((a, b) => a + b.total, 0);
  const progressPct = totalAll ? totalDone / totalAll : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} tintColor="#7C3AED" />}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={goToProfil} style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </Pressable>
            <View style={styles.headerInfo}>
              <Text variant="titleMedium" style={styles.greeting}>Merhaba {name.split(' ')[0]}</Text>
              <View style={styles.headerMeta}>
                <MaterialCommunityIcons name="book-open-variant" size={14} color="#7C3AED" />
                <View style={styles.miniProgress}>
                  <View style={[styles.miniProgressFill, { width: `${progressPct * 100}%` }]} />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.notifWrap}>
            <IconButton icon="bell-outline" size={22} onPress={() => navigation.navigate('BildirimListesi')} style={styles.notifBtn} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Motivasyon sözü */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteRow}>
            <MaterialCommunityIcons name="format-quote-open" size={24} color="rgba(124,58,237,0.4)" />
            <Text style={styles.quoteText}>{quote}</Text>
          </View>
        </View>

        {/* Dersler - 2'li grid */}
        <Text style={styles.sectionTitle}>Dersler</Text>
        <View style={styles.subjectGrid}>
          {subjects.map((item, i) => {
            const theme = getCardTheme(item.name, item.slug, i);
            const p = DEMO_P[item.id] ?? { done: 0, total: 1 };
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.card, styles.cardHalf, { backgroundColor: theme.bg, width: CARD_WIDTH }, pressed && styles.cardPressed]}
                onPress={() => navigation.navigate('TopicSelect', { subjectId: item.id, subjectName: item.name })}
              >
                <View style={[styles.decoCircle, styles.decoCircle1, { borderColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={[styles.decoStar, styles.decoStar1]}>
                  <MaterialCommunityIcons name="star-four-points" size={16} color="rgba(255,255,255,0.25)" />
                </View>
                <View style={styles.cardTop}>
                  <View style={[styles.cardIconWrap, styles.cardIconWrapSmall, { backgroundColor: theme.iconBg }]}>
                    <MaterialCommunityIcons name={theme.icon as any} size={18} color="#1E293B" />
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{(pct / 10).toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.cardCategory}>KPSS</Text>
                <Text style={styles.cardTitleSmall} numberOfLines={2}>{item.name}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardMetaText}>{p.done}/{p.total}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#1E293B" />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Duyurular */}
        <Text style={styles.sectionTitle}>Duyurular</Text>
        <View style={styles.duyuruList}>
          {announcements.length === 0 ? (
            <Text style={styles.duyuruEmpty}>Şu an duyuru yok.</Text>
          ) : (
            announcements.map((d) => (
              <View key={d.id} style={styles.duyuruItem}>
                <View style={styles.duyuruDot} />
                <View style={styles.duyuruContent}>
                  <Text style={styles.duyuruTitle}>{d.title}</Text>
                  {d.excerpt ? <Text style={styles.duyuruExcerpt}>{d.excerpt}</Text> : null}
                  <Text style={styles.duyuruDate}>{formatDuyuruDate(d.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <AdBannerSlot slot={adSlots['home_banner']} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EDF7' },
  scroll: { paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerInfo: { justifyContent: 'center' },
  greeting: { fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniProgress: { width: 80, height: 6, borderRadius: 3, backgroundColor: 'rgba(124,58,237,0.15)' },
  miniProgressFill: { height: '100%', borderRadius: 3, backgroundColor: '#7C3AED' },
  notifWrap: { position: 'relative' },
  notifBtn: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 22, backgroundColor: '#fff' },
  notifBadge: { position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  notifBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  // Motivasyon
  quoteCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  quoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  quoteText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1E293B', lineHeight: 24, fontStyle: 'italic' },

  // Bölüm başlıkları
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },

  // Dersler grid (2'li)
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginBottom: 28 },
  card: { borderRadius: 20, padding: 14, minHeight: 160, overflow: 'hidden', position: 'relative' },
  cardHalf: { marginBottom: 0 },
  cardPressed: { transform: [{ scale: 0.97 }], opacity: 0.95 },

  decoCircle: { position: 'absolute', borderRadius: 999, borderWidth: 2 },
  decoCircle1: { width: 70, height: 70, top: -14, right: -14 },
  decoStar: { position: 'absolute' },
  decoStar1: { top: 44, right: 16 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardIconWrapSmall: { width: 36, height: 36, borderRadius: 10 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  scoreText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },

  cardCategory: { fontSize: 10, fontWeight: '600', color: 'rgba(30,41,59,0.6)', marginBottom: 2 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 16, lineHeight: 28 },
  cardTitleSmall: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 8, lineHeight: 20 },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 11, fontWeight: '600', color: 'rgba(30,41,59,0.7)' },
  arrowBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },

  // Duyurular
  duyuruList: { gap: 12 },
  duyuruEmpty: { fontSize: 14, color: '#64748B', fontStyle: 'italic', paddingVertical: 12 },
  duyuruItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  duyuruDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED', marginTop: 6, marginRight: 12 },
  duyuruContent: { flex: 1 },
  duyuruTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  duyuruExcerpt: { fontSize: 13, color: 'rgba(30,41,59,0.7)', lineHeight: 20, marginBottom: 6 },
  duyuruDate: { fontSize: 11, color: '#64748B', fontWeight: '500' },
});
