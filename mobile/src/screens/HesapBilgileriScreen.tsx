import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, List, Divider, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HesapBilgileri'>;

export default function HesapBilgileriScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session, refreshSession } = useAuth();
  const name = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || '-';
  const email = session?.user?.email ?? '-';
  const createdAt = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString('tr-TR')
    : '-';

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleUpdateEmail = async () => {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setEmailMessage({ type: 'error', text: 'Yeni e-posta adresi girin.' });
      return;
    }
    if (!supabase) {
      setEmailMessage({ type: 'error', text: 'Bağlantı yapılandırılmamış.' });
      return;
    }
    setEmailLoading(true);
    setEmailMessage(null);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setEmailLoading(false);
    if (error) {
      setEmailMessage({ type: 'error', text: error.message || 'E-posta güncellenemedi.' });
      return;
    }
    setEmailMessage({ type: 'success', text: 'Doğrulama linki yeni adresinize gönderildi. E-postanızı kontrol edin.' });
    setNewEmail('');
    refreshSession();
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
      return;
    }
    if (!supabase) {
      setPasswordMessage({ type: 'error', text: 'Bağlantı yapılandırılmamış.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Şifre güncellenemedi.' });
      return;
    }
    setPasswordMessage({ type: 'success', text: 'Şifreniz güncellendi.' });
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={APP_THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, ...APP_THEME.shadow.card }]}>
          <List.Item
            title="Ad Soyad"
            description={name}
            titleStyle={styles.label}
            descriptionStyle={styles.value}
            left={(p) => <List.Icon {...p} icon="account-outline" color={APP_THEME.primary} />}
          />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item
            title="E-posta"
            description={email}
            titleStyle={styles.label}
            descriptionStyle={styles.value}
            left={(p) => <List.Icon {...p} icon="email-outline" color={APP_THEME.primary} />}
          />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item
            title="Üyelik tarihi"
            description={createdAt}
            titleStyle={styles.label}
            descriptionStyle={styles.value}
            left={(p) => <List.Icon {...p} icon="calendar-outline" color={APP_THEME.primary} />}
          />
        </View>

        <Text style={styles.sectionTitle}>E-posta değiştir</Text>
        <TextInput
          mode="outlined"
          label="Yeni e-posta"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          outlineColor={APP_THEME.border}
          activeOutlineColor={APP_THEME.primary}
        />
        {emailMessage ? (
          <Text style={[styles.message, emailMessage.type === 'error' ? styles.messageError : styles.messageSuccess]}>{emailMessage.text}</Text>
        ) : null}
        <Button mode="contained" onPress={handleUpdateEmail} loading={emailLoading} disabled={emailLoading} style={styles.btn}>
          E-postayı güncelle
        </Button>

        <Text style={styles.sectionTitle}>Şifre değiştir</Text>
        <TextInput
          mode="outlined"
          label="Yeni şifre"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          outlineColor={APP_THEME.border}
          activeOutlineColor={APP_THEME.primary}
        />
        <TextInput
          mode="outlined"
          label="Yeni şifre (tekrar)"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          outlineColor={APP_THEME.border}
          activeOutlineColor={APP_THEME.primary}
        />
        {passwordMessage ? (
          <Text style={[styles.message, passwordMessage.type === 'error' ? styles.messageError : styles.messageSuccess]}>{passwordMessage.text}</Text>
        ) : null}
        <Button mode="contained" onPress={handleUpdatePassword} loading={passwordLoading} disabled={passwordLoading} style={styles.btn}>
          Şifreyi güncelle
        </Button>
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
  card: { overflow: 'hidden', marginBottom: 20 },
  label: { fontWeight: '600', color: APP_THEME.text },
  value: { color: APP_THEME.textMuted2, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: APP_THEME.text, marginBottom: 12, marginTop: 8 },
  input: { marginBottom: 12, backgroundColor: APP_THEME.surface },
  btn: { marginBottom: 24 },
  message: { fontSize: 13, marginBottom: 8 },
  messageError: { color: '#DC2626' },
  messageSuccess: { color: '#059669' },
});
