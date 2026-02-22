import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_THEME } from '../theme';

export default function ConfigRequiredScreen() {
  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: APP_THEME.cardPastel[4] }]}>
          <View style={[styles.iconWrap, { backgroundColor: APP_THEME.surface }]}>
            <MaterialCommunityIcons name="cog-outline" size={48} color={APP_THEME.primary} />
          </View>
          <Text variant="headlineSmall" style={[styles.title, { color: APP_THEME.text }]}>Ayarlar Gerekli</Text>
          <Text variant="bodyMedium" style={[styles.message, { color: APP_THEME.textMuted2 }]}>
            Uygulamanın çalışması için Supabase bağlantısı tanımlanmalı.
          </Text>
          <Text variant="bodySmall" style={[styles.steps, { color: APP_THEME.text }]}>
            1. <Text style={{ fontWeight: '700' }}>mobile</Text> klasöründe <Text style={styles.code}>.env</Text> dosyası oluşturun.{'\n\n'}
            2. Şu satırları ekleyin:{'\n\n'}
            <Text style={styles.code}>
              EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co{'\n'}
              EXPO_PUBLIC_SUPABASE_ANON_KEY=anon-key-buraya
            </Text>
            {'\n\n'}
            3. Projeyi yeniden başlatın: <Text style={styles.code}>npm start</Text>
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 24, color: APP_THEME.textMuted2, textAlign: 'center' }}>
            .env.example dosyasını kopyalayıp .env yapıp düzenleyebilirsiniz.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 56, alignItems: 'center' },
  card: { borderRadius: APP_THEME.radius.card, padding: 28, width: '100%', maxWidth: 400, ...APP_THEME.shadow.card },
  iconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'center', ...APP_THEME.shadow.card },
  title: { fontWeight: '800', marginBottom: 12, textAlign: 'center', fontSize: 28 },
  message: { textAlign: 'center', marginBottom: 24 },
  steps: { lineHeight: 22, width: '100%' },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: APP_THEME.border,
    color: APP_THEME.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
