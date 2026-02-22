import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Gizlilik'>;

export default function GizlilikScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={APP_THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Gizlilik</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, ...APP_THEME.shadow.card }]}>
          <List.Item
            title="Veri toplama"
            description="İlerleme, kart görüntüleme ve oturum süreleri yalnızca hesabınızla ilişkilendirilir."
            titleStyle={styles.label}
            descriptionStyle={styles.para}
            left={(p) => <List.Icon {...p} icon="database-outline" color="#10B981" />}
          />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item
            title="Veri saklama"
            description="Verileriniz Supabase üzerinde güvenli tutulur. Hesabı sildiğinizde ilgili veriler kaldırılır."
            titleStyle={styles.label}
            descriptionStyle={styles.para}
            left={(p) => <List.Icon {...p} icon="shield-check-outline" color="#10B981" />}
          />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item
            title="Üçüncü taraflar"
            description="Kişisel verileriniz reklam veya pazarlama amaçlı üçüncü taraflarla paylaşılmaz."
            titleStyle={styles.label}
            descriptionStyle={styles.para}
            left={(p) => <List.Icon {...p} icon="hand-back-right-outline" color="#10B981" />}
          />
        </View>
        <Text style={styles.footer}>Gizlilik politikasında değişiklik olursa uygulama içinden bilgilendirileceksiniz.</Text>
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
  card: { overflow: 'hidden', marginBottom: 16 },
  label: { fontWeight: '600', color: APP_THEME.text },
  para: { fontSize: 14, color: APP_THEME.textMuted2, marginTop: 4, lineHeight: 22 },
  footer: { fontSize: 13, color: APP_THEME.textMuted2, lineHeight: 20 },
});
