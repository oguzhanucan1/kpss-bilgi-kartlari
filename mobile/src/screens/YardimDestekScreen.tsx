import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'YardimDestek'>;

const FAQ = [
  { q: 'Kartlar nasıl çalışır?', a: 'Konu seçin, kartları yukarı-aşağı kaydırarak ilerleyin. Gördüğünüz kartlar otomatik kaydedilir ve Analiz ekranında görüntülenir.' },
  { q: 'Kaydedilen kartlara nasıl ulaşırım?', a: 'Kaydedilen sekmesinden kaydettiğiniz kartları görebilir ve tıklayarak doğrudan o karta gidebilirsiniz.' },
  { q: 'İlerleme nerede görünür?', a: 'Konular ekranında "Toplam İlerleme" ve her ders kartında ilerleme; detaylı istatistikler Analiz sekmesindedir.' },
];

export default function YardimDestekScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={APP_THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Yardım & Destek</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
        <View style={[styles.card, { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, ...APP_THEME.shadow.card }]}>
          {FAQ.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Divider style={{ backgroundColor: APP_THEME.border }} />}
              <List.Item
                title={item.q}
                description={item.a}
                titleStyle={styles.faqTitle}
                descriptionStyle={styles.faqDesc}
                titleNumberOfLines={2}
              />
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionTitle}>İletişim</Text>
        <View style={[styles.card, { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, ...APP_THEME.shadow.card }]}>
          <List.Item
            title="E-posta ile destek"
            description="Sorularınız için bize yazın"
            titleStyle={styles.label}
            descriptionStyle={styles.desc}
            left={(p) => <List.Icon {...p} icon="email-outline" color="#3B82F6" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" color={APP_THEME.textMuted2} />}
            onPress={() => Linking.openURL('mailto:destek@example.com')}
          />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item
            title="Gizlilik politikası"
            description="Veri kullanımı ve gizlilik"
            titleStyle={styles.label}
            descriptionStyle={styles.desc}
            left={(p) => <List.Icon {...p} icon="shield-outline" color="#3B82F6" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" color={APP_THEME.textMuted2} />}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: APP_THEME.text },
  scroll: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: APP_THEME.text, marginBottom: 12, marginTop: 8 },
  card: { overflow: 'hidden', marginBottom: 20 },
  label: { fontWeight: '600', color: APP_THEME.text },
  desc: { fontSize: 13, color: APP_THEME.textMuted2, marginTop: 2 },
  faqTitle: { fontWeight: '600', color: APP_THEME.text, fontSize: 15 },
  faqDesc: { fontSize: 14, color: APP_THEME.textMuted2, marginTop: 4, lineHeight: 22 },
});
