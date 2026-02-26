import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const MAX_FORM_WIDTH = 400;

export default function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleRegister = async () => {
    if (!email.trim() || !password) { Alert.alert('Hata', 'E-posta ve şifre girin.'); return; }
    if (password.length < 6) { Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.'); return; }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim() || undefined);
    setLoading(false);
    if (error) {
      const msg = (error.message || '').toLowerCase();
      let body = error.message;
      if (msg.includes('rate limit') || msg.includes('rate_limit') || msg.includes('too many')) {
        body = 'Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin.';
      } else if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('23505') || msg.includes('already registered')) {
        body = 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.';
      } else if (msg.includes('signup') || msg.includes('sign_up') || msg.includes('insert') || msg.includes('profiles')) {
        body = 'Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      } else if (msg.includes('network') || msg.includes('fetch')) {
        body = 'İnternet bağlantınızı kontrol edin.';
      } else if (msg.includes('password') || msg.includes('weak')) {
        body = 'Şifre yeterince güçlü değil. En az 6 karakter kullanın.';
      }
      Alert.alert('Kayıt yapılamadı', body);
    } else {
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} style={styles.backBtn} iconColor={APP_THEME.text} />

        <View style={styles.headingWrap}>
          <Text style={styles.pageTitle}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>KPSS hazırlığına hemen başla</Text>
        </View>

        <View style={styles.formWrap}>
          <View style={styles.card}>
            <TextInput
              label="Ad"
              mode="outlined"
              value={fullName}
              onChangeText={setFullName}
              disabled={loading}
              placeholder="Adınız"
              style={styles.input}
              left={<TextInput.Icon icon="account-outline" />}
              outlineColor={APP_THEME.border}
              activeOutlineColor={APP_THEME.primary}
              theme={{ roundness: 14 }}
            />
            <TextInput
              label="E-posta"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              disabled={loading}
              placeholder="ornek@email.com"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
              outlineColor={APP_THEME.border}
              activeOutlineColor={APP_THEME.primary}
              theme={{ roundness: 14 }}
            />
            <TextInput
              label="Şifre"
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              disabled={loading}
              placeholder="En az 6 karakter"
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={secureText ? 'eye-off-outline' : 'eye-outline'} onPress={() => setSecureText(!secureText)} />}
              outlineColor={APP_THEME.border}
              activeOutlineColor={APP_THEME.primary}
              theme={{ roundness: 14 }}
            />
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.primaryBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              Kayıt Ol
            </Button>
          </View>

          <Button mode="text" onPress={() => navigation.replace('Login')} disabled={loading} style={styles.link} labelStyle={styles.linkLabel}>
            Zaten hesabınız var mı? Giriş yapın
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  headingWrap: { width: '100%', maxWidth: MAX_FORM_WIDTH, alignItems: 'center', marginBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: APP_THEME.text, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 15, color: APP_THEME.textMuted2, textAlign: 'center' },
  formWrap: { width: '100%', maxWidth: MAX_FORM_WIDTH, alignItems: 'stretch' },
  card: {
    backgroundColor: APP_THEME.surface,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    ...APP_THEME.shadow?.card ?? {},
    borderWidth: 1,
    borderColor: APP_THEME.border,
  },
  input: { marginBottom: 18, backgroundColor: 'transparent' },
  primaryBtn: {
    borderRadius: 14,
    backgroundColor: APP_THEME.primary,
    marginTop: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnContent: { paddingVertical: 8 },
  btnLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  link: { marginTop: 4 },
  linkLabel: { color: APP_THEME.primary, fontWeight: '600', fontSize: 15 },
});
