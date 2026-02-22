import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAdSlots } from '../hooks/useAdSlots';
import { AdBannerSlot } from '../components/AdBannerSlot';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string;
};
type Props = NativeStackScreenProps<MainStackParamList, 'Test'>;

export default function TestScreen({ route, navigation }: Props) {
  const { topicId, topicName } = route.params;
  const adSlots = useAdSlots();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('test_questions')
        .select('id, question_text, option_a, option_b, option_c, option_d, correct_option')
        .eq('topic_id', topicId)
        .order('sort_order', { ascending: true });
      if (!error) setQuestions((data as Question[]) ?? []);
      setLoading(false);
    })();
  }, [topicId]);

  const current = questions[currentIndex];
  const options = [
    { key: 'A', text: current?.option_a },
    { key: 'B', text: current?.option_b },
    current?.option_c ? { key: 'C', text: current.option_c } : null,
    current?.option_d ? { key: 'D', text: current.option_d } : null,
  ].filter(Boolean) as { key: string; text: string }[];

  const handleSelect = (key: string) => {
    if (showResult) return;
    setSelected(key);
    setShowResult(true);
    if (key === current?.correct_option) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Bu konuda henüz test sorusu yok.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Geri</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.centered}>
        <Text style={styles.resultTitle}>Test tamamlandı</Text>
        <Text style={styles.resultScore}>
          {score} / {questions.length}
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.getParent()?.goBack()}
        >
          <Text style={styles.backBtnText}>Ders seçime dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.topicName} numberOfLines={1}>{topicName}</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.question}>{current?.question_text}</Text>
        <AdBannerSlot slot={adSlots['test_banner']} />
        {options.map((opt) => {
          const isCorrect = opt.key === current?.correct_option;
          const isWrong = selected === opt.key && !isCorrect;
          let btnStyle = styles.optionBtn;
          if (showResult) {
            if (isCorrect) btnStyle = [styles.optionBtn, styles.optionCorrect];
            else if (isWrong) btnStyle = [styles.optionBtn, styles.optionWrong];
          }
          return (
            <TouchableOpacity
              key={opt.key}
              style={btnStyle}
              onPress={() => handleSelect(opt.key)}
              disabled={showResult}
            >
              <Text style={styles.optionKey}>{opt.key}.</Text>
              <Text style={styles.optionText}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {showResult && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? 'Sonraki soru' : 'Sonuçları gör'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#666' },
  emptyText: { color: '#333', fontSize: 16 },
  backBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  topicName: { fontSize: 16, color: '#666', flex: 1 },
  counter: { fontSize: 14, color: '#666' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  optionKey: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 4 },
  optionText: { fontSize: 16, color: '#1a1a1a' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  resultScore: { fontSize: 32, fontWeight: '800', color: '#2563eb', marginTop: 8 },
});
