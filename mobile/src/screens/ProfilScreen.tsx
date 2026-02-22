import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, List, Divider, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profil'>;

export default function ProfilScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const name = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Kullanıcı';
  const email = session?.user?.email ?? '—';
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={[styles.container, { backgroundColor: APP_THEME.background }]} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View>
        <Text variant="headlineSmall" style={[styles.title, { color: APP_THEME.text }]}>Profil</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text variant="headlineMedium" style={{ color: '#fff', fontWeight: '700' }}>{initials}</Text>
        </View>
        <Text variant="titleMedium" style={{ fontWeight: '700', color: APP_THEME.text, marginTop: 12 }}>{name}</Text>
        <Text variant="bodyMedium" style={{ color: APP_THEME.textMuted2 }}>{email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, ...APP_THEME.shadow.card }]}>
        <List.Item title="Hesap Bilgileri" titleStyle={{ color: APP_THEME.text }} left={(props) => <List.Icon {...props} icon="account-outline" color={APP_THEME.primary} />} right={(props) => <List.Icon {...props} icon="chevron-right" color={APP_THEME.textMuted2} />} onPress={() => navigation.navigate('HesapBilgileri')} />
        <Divider style={{ backgroundColor: APP_THEME.border }} />
        <List.Item title="Bildirimler" titleStyle={{ color: APP_THEME.text }} left={(props) => <List.Icon {...props} icon="bell-outline" color="#F59E0B" />} right={(props) => <List.Icon {...props} icon="chevron-right" color={APP_THEME.textMuted2} />} onPress={() => navigation.navigate('Bildirimler')} />
        <Divider style={{ backgroundColor: APP_THEME.border }} />
        <List.Item title="Gizlilik" titleStyle={{ color: APP_THEME.text }} left={(props) => <List.Icon {...props} icon="shield-check-outline" color="#10B981" />} right={(props) => <List.Icon {...props} icon="chevron-right" color={APP_THEME.textMuted2} />} onPress={() => navigation.navigate('Gizlilik')} />
        <Divider style={{ backgroundColor: APP_THEME.border }} />
        <List.Item title="Yardım & Destek" titleStyle={{ color: APP_THEME.text }} left={(props) => <List.Icon {...props} icon="help-circle-outline" color="#3B82F6" />} right={(props) => <List.Icon {...props} icon="chevron-right" color={APP_THEME.textMuted2} />} onPress={() => navigation.navigate('YardimDestek')} />
      </View>

      <View>
        <Button mode="outlined" onPress={() => signOut()} icon="logout" textColor="#EF4444" style={styles.logoutBtn} contentStyle={styles.logoutContent}>
          Çıkış Yap
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  title: { fontWeight: '800', marginBottom: 24, fontSize: 28 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: APP_THEME.primary, ...APP_THEME.shadow.button },
  card: { marginBottom: 20, overflow: 'hidden' },
  logoutBtn: { borderRadius: APP_THEME.radius.button, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' },
  logoutContent: { paddingVertical: 4 },
});
