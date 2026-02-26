import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

const MAX_FORM_WIDTH = 400;

/** Supabase/auth hata mesajlarını kullanıcı dostu Türkçe metne çevirir */
function getLoginErrorMessage(error: Error): string {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('invalid login') || msg.includes('invalid_credentials') || msg.includes('invalid login credentials')) {
    return 'E-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.';
  }
  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return 'E-posta adresinizi doğrulayın. Gelen kutunuzu ve istenmeyen klasörünü kontrol edin.';
  }
  if (msg.includes('rate limit') || msg.includes('rate_limit') || msg.includes('too many')) {
    return 'Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'İnternet bağlantınızı kontrol edin.';
  }
  return error?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
}

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Eksik bilgi', 'E-posta adresinizi girin.');
      return;
    }
    if (!password) {
      Alert.alert('Eksik bilgi', 'Şifrenizi girin.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Giriş yapılamadı', getLoginErrorMessage(error));
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
          <Text style={styles.pageTitle}>Üye Giriş</Text>
          <Text style={styles.subtitle}>E-posta ve şifre ile hesabına giriş yap</Text>
        </View>

        <View style={styles.formWrap}>
          <View style={styles.card}>
            <TextInput
              label="E-posta"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
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
              textContentType="password"
              disabled={loading}
              placeholder="Şifrenizi girin"
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={secureText ? 'eye-off-outline' : 'eye-outline'} onPress={() => setSecureText(!secureText)} />}
              outlineColor={APP_THEME.border}
              activeOutlineColor={APP_THEME.primary}
              theme={{ roundness: 14 }}
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.primaryBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              Giriş Yap
            </Button>
          </View>

          <Button mode="text" onPress={() => navigation.replace('Register')} disabled={loading} style={styles.link} labelStyle={styles.linkLabel}>
            Hesabınız yok mu? Kayıt olun
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
    ...(APP_THEME.shadow?.card ?? {}),
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
