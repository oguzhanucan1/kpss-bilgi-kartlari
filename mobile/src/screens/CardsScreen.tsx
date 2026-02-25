import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, FlatList, RefreshControl, type ListRenderItemInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, IconButton, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useAdSlots } from '../hooks/useAdSlots';
import { AdSlotView } from '../components/AdSlotView';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type FlashCard = { id: string; title: string | null; content: string };

type ListItem =
  | { type: 'card'; card: FlashCard; cardIndex: number }
  | { type: 'ad'; slotKey: string };

function buildListWithAds(cards: FlashCard[], slot: { slug: string } | null): ListItem[] {
  if (!slot) return cards.map((card, i) => ({ type: 'card' as const, card, cardIndex: i }));
  const items: ListItem[] = [];
  for (let i = 0; i < cards.length; i++) {
    if (i > 0 && i % 10 === 0) items.push({ type: 'ad', slotKey: slot.slug });
    items.push({ type: 'card', card: cards[i], cardIndex: i });
  }
  return items;
}

function cardIndexToListIndex(cardIndex: number, hasAds: boolean): number {
  if (!hasAds) return cardIndex;
  return cardIndex + Math.floor(cardIndex / 10);
}

type Props = NativeStackScreenProps<MainStackParamList, 'Cards'>;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 30;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function CardsScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const adSlots = useAdSlots();
  const slotCardsEvery10 = adSlots['cards_every_10'] ?? null;
  const { topicId, topicName, subjectId, subjectName, initialFlashCardId } = route.params;
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<ListItem>>(null);
  const onEndReachedCalled = useRef(false);
  const scrollStartY = useRef(0);
  const userDidDrag = useRef(false);
  const hasScrolledToInitial = useRef(false);
  const viewStartTimeRef = useRef<number>(Date.now());
  const recordCardViewRef = useRef<(id: string, sec: number) => Promise<void>>(async () => {});
  const currentIndexRef = useRef(0);
  const listDataRef = useRef<ListItem[]>([]);
  const cardHeight = SCREEN_HEIGHT;

  const listData = useMemo(
    () => buildListWithAds(cards, slotCardsEvery10),
    [cards, slotCardsEvery10]
  );
  const hasAds = !!slotCardsEvery10;
  listDataRef.current = listData;
  currentIndexRef.current = currentIndex;

  const initialScrollIndex = useMemo(() => {
    if (!initialFlashCardId || !cards.length) return 0;
    const idx = cards.findIndex((c) => c.id === initialFlashCardId);
    if (idx < 0) return 0;
    return cardIndexToListIndex(idx, hasAds);
  }, [cards, initialFlashCardId, hasAds]);

  const recordCardView = useCallback(async (flashCardId: string, durationSeconds: number) => {
    if (!supabase || !userId || durationSeconds < 0) return;
    await supabase.from('card_views').insert({ user_id: userId, flash_card_id: flashCardId, duration_seconds: Math.round(durationSeconds) });
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);
    await supabase.from('card_review_state').upsert(
      { user_id: userId, flash_card_id: flashCardId, last_viewed_at: new Date().toISOString(), next_review_at: nextReview.toISOString(), interval_days: 1, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,flash_card_id' }
    );
  }, [userId]);

  const loadCards = useCallback(async () => {
    if (!supabase) return;
    if (subjectId) {
      const { data: topicList } = await supabase.from('topics').select('id').eq('subject_id', subjectId);
      const topicIds = (topicList ?? []).map((t: { id: string }) => t.id);
      if (topicIds.length === 0) { setCards([]); return; }
      const { data, error } = await supabase.from('flash_cards').select('id, title, content').in('topic_id', topicIds).order('sort_order', { ascending: true });
      if (!error) setCards(shuffle((data as FlashCard[]) ?? []));
    } else if (topicId) {
      const { data, error } = await supabase.from('flash_cards').select('id, title, content').eq('topic_id', topicId).order('sort_order', { ascending: true });
      if (!error) setCards(shuffle((data as FlashCard[]) ?? []));
    } else {
      setCards([]);
    }
  }, [topicId, subjectId]);

  const loadSavedIds = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase.from('saved_cards').select('flash_card_id').eq('user_id', userId);
    if (!error && data) setSavedIds(new Set((data as { flash_card_id: string }[]).map((r) => r.flash_card_id)));
  }, [userId]);

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadCards(), loadSavedIds()]);
      setLoading(false);
    };
    run();
  }, [loadCards, loadSavedIds]);

  useEffect(() => {
    hasScrolledToInitial.current = false;
  }, [topicId, initialFlashCardId]);

  useEffect(() => {
    if (listData.length === 0) return;
    const item = listData[currentIndex];
    if (item?.type === 'card') setCurrentCard(item.card);
  }, [listData, currentIndex]);

  useEffect(() => {
    if (!initialFlashCardId || !cards.length || hasScrolledToInitial.current) return;
    const cardIndex = cards.findIndex((c) => c.id === initialFlashCardId);
    if (cardIndex >= 0 && listRef.current) {
      const listIndex = cardIndexToListIndex(cardIndex, hasAds);
      hasScrolledToInitial.current = true;
      setCurrentIndex(listIndex);
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: listIndex * cardHeight, animated: false });
      }, 50);
    }
  }, [cards, initialFlashCardId, cardHeight, hasAds]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    await loadSavedIds();
    setRefreshing(false);
  }, [loadCards, loadSavedIds]);

  const toggleSave = useCallback(async (cardId: string) => {
    if (!supabase || !userId) return;
    if (savedIds.has(cardId)) {
      await supabase.from('saved_cards').delete().eq('user_id', userId).eq('flash_card_id', cardId);
      setSavedIds((p) => { const n = new Set(p); n.delete(cardId); return n; });
    } else {
      await supabase.from('saved_cards').insert({ user_id: userId, flash_card_id: cardId });
      setSavedIds((p) => new Set(p).add(cardId));
    }
  }, [userId, savedIds]);

  recordCardViewRef.current = recordCardView;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    const idx = viewableItems[0]?.index;
    if (idx == null) return;
    onEndReachedCalled.current = false;
    const list = listDataRef.current;
    const item = list[idx];
    const prevItem = list[currentIndexRef.current];
    setCurrentIndex((prev) => {
      if (prev !== idx && prevItem?.type === 'card') {
        const duration = (Date.now() - viewStartTimeRef.current) / 1000;
        recordCardViewRef.current(prevItem.card.id, duration);
      }
      viewStartTimeRef.current = Date.now();
      return idx;
    });
    setCurrentCard((prev) => (item?.type === 'card' ? item.card : prev));
  }).current;
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 90 }).current;

  useEffect(() => () => {
    const list = listDataRef.current;
    const cur = currentIndexRef.current;
    const item = list[cur];
    if (item?.type === 'card') {
      const duration = (Date.now() - viewStartTimeRef.current) / 1000;
      recordCardViewRef.current(item.card.id, duration);
    }
  }, []);

  const onScrollBeginDrag = useCallback(({ nativeEvent }: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollStartY.current = nativeEvent.contentOffset.y; userDidDrag.current = true;
  }, []);

  const onScrollEnd = useCallback(({ nativeEvent }: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (!userDidDrag.current) return; userDidDrag.current = false;
    const y = nativeEvent.contentOffset.y, delta = y - scrollStartY.current, cur = Math.round(y / cardHeight);
    const maxIdx = listData.length - 1;
    let target: number;
    if (delta > SWIPE_THRESHOLD) target = Math.min(cur + 1, maxIdx);
    else if (delta < -SWIPE_THRESHOLD) target = Math.max(cur - 1, 0);
    else target = Math.max(0, Math.min(cur, maxIdx));
    const off = target * cardHeight;
    if (Math.abs(y - off) > 2) listRef.current?.scrollToOffset({ offset: off, animated: true });
  }, [cardHeight, listData.length]);

  const handleEndReached = useCallback(() => {
    if (!cards.length || onEndReachedCalled.current) return;
    onEndReachedCalled.current = true;
    setCards((prev) => [...prev, ...shuffle([...cards])]);
  }, [cards]);

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<ListItem>) => {
    if (item.type === 'ad') {
      const slot = adSlots[item.slotKey];
      if (!slot) return <View style={{ height: cardHeight, width: SCREEN_WIDTH }} />;
      return <AdSlotView slot={slot} height={cardHeight} />;
    }
    return <CardItem card={item.card} cardHeight={cardHeight} insets={insets} />;
  }, [cardHeight, insets, adSlots]);

  const keyExtractor = useCallback((item: ListItem, index: number) => item.type === 'card' ? `card-${index}-${item.card.id}` : `ad-${index}`, []);

  const getItemLayout = useCallback((_: unknown, index: number) => ({ length: cardHeight, offset: cardHeight * index, index }), [cardHeight]);

  if (loading) return <View style={[styles.centered, { backgroundColor: APP_THEME.background }]}><ActivityIndicator size="large" color={APP_THEME.primary} /></View>;

  if (!cards.length) {
    return (
      <View style={[styles.centered, { backgroundColor: APP_THEME.background }]}>
        <MaterialCommunityIcons name="cards-outline" size={56} color="#CBD5E1" />
        <Text variant="bodyLarge" style={{ color: APP_THEME.textMuted2, marginTop: 16 }}>Bu konuda henüz bilgi kartı yok.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 20, borderRadius: APP_THEME.radius.button, backgroundColor: APP_THEME.primary }}>Geri Dön</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="arrow-left" size={22} onPress={() => navigation.goBack()} style={[styles.headerBtn, { backgroundColor: APP_THEME.surface, borderColor: APP_THEME.border }]} iconColor={APP_THEME.text} />
        <Text variant="bodyMedium" style={{ flex: 1, color: APP_THEME.textMuted2 }} numberOfLines={1}>{topicName}</Text>
        <Button
          mode={currentCard && savedIds.has(currentCard.id) ? 'contained' : 'outlined'}
          onPress={() => currentCard && toggleSave(currentCard.id)}
          icon={currentCard && savedIds.has(currentCard.id) ? 'bookmark' : 'bookmark-outline'}
          compact
          style={[styles.saveBtn, currentCard && savedIds.has(currentCard.id) && styles.saveBtnActive]}
          labelStyle={styles.saveBtnLabel}
        >
          {currentCard && savedIds.has(currentCard.id) ? 'Kaydedildi' : 'Kaydet'}
        </Button>
      </View>

      <FlatList
        ref={listRef}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        pagingEnabled
        snapToInterval={cardHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={initialFlashCardId ? Math.max(2, initialScrollIndex + 2) : 2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_THEME.primary]} tintColor={APP_THEME.primary} />}
      />
    </View>
  );
}

const CardItem = React.memo(function CardItem({ card, cardHeight, insets }: {
  card: FlashCard; cardHeight: number;
  insets: { top: number; bottom: number };
}) {
  const text = useMemo(() => String(card.content || '').replace(/<[^>]*>/g, ' ').trim(), [card.content]);
  return (
    <View style={[styles.cardWrap, { height: cardHeight }]}>
      <View style={[styles.cardContent, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 64 }]}>
        <View style={styles.cardBody}>
          <View style={styles.cardInner}>
            <Text variant="bodyLarge" style={styles.cardText} selectable>{text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: APP_THEME.background },
  header: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, zIndex: 10 },
  headerBtn: { borderWidth: 1, borderRadius: 20 },
  saveBtn: { borderRadius: APP_THEME.radius.button, borderColor: APP_THEME.primary },
  saveBtnActive: { backgroundColor: APP_THEME.primary },
  saveBtnLabel: { fontSize: 13, fontWeight: '600' },
  cardWrap: { width: SCREEN_WIDTH },
  cardContent: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  cardBody: { width: '100%', maxWidth: 500, justifyContent: 'center', alignItems: 'center' },
  cardInner: { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, padding: 28, width: '100%', maxWidth: 500, ...APP_THEME.shadow.card },
  cardText: { color: APP_THEME.text, fontSize: 22, fontWeight: '500', lineHeight: 34, textAlign: 'center' },
});
