import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
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
    if (error) { Alert.alert('Kayıt hatası', error.message); }
    else { Alert.alert('Başarılı', 'E-posta adresinize gelen link ile hesabınızı doğrulayın.'); navigation.replace('Login'); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} style={styles.backBtn} iconColor={APP_THEME.text} />

        <Text style={styles.pageTitle}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>KPSS hazırlığına hemen başla</Text>

        <View style={styles.card}>
          <View style={[styles.decoCircle, { borderColor: 'rgba(124,58,237,0.12)' }]} />
          <TextInput label="Ad Soyad" mode="outlined" value={fullName} onChangeText={setFullName} disabled={loading} style={styles.input} left={<TextInput.Icon icon="account-outline" />} outlineColor={APP_THEME.border} activeOutlineColor={APP_THEME.primary} />
          <TextInput label="E-posta" mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" disabled={loading} style={styles.input} left={<TextInput.Icon icon="email-outline" />} outlineColor={APP_THEME.border} activeOutlineColor={APP_THEME.primary} />
          <TextInput label="Şifre" mode="outlined" value={password} onChangeText={setPassword} secureTextEntry={secureText} disabled={loading} style={styles.input} left={<TextInput.Icon icon="lock-outline" />} right={<TextInput.Icon icon={secureText ? 'eye-off-outline' : 'eye-outline'} onPress={() => setSecureText(!secureText)} />} outlineColor={APP_THEME.border} activeOutlineColor={APP_THEME.primary} />
          <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.primaryBtn} contentStyle={styles.btnContent} labelStyle={styles.btnLabel}>
            Kayıt Ol
          </Button>
        </View>

        <Button mode="text" onPress={() => navigation.replace('Login')} disabled={loading} style={styles.link} labelStyle={styles.linkLabel}>
          Zaten hesabınız var mı? Giriş yapın
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.background },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 8 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  pageTitle: { fontSize: 32, fontWeight: '800', color: APP_THEME.text, marginBottom: 4, lineHeight: 40 },
  subtitle: { fontSize: 16, color: APP_THEME.textMuted2, marginBottom: 24 },
  card: { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: APP_THEME.border },
  decoCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2, top: -20, right: -20 },
  input: { marginBottom: 14, backgroundColor: APP_THEME.background },
  primaryBtn: { borderRadius: APP_THEME.radius.button, backgroundColor: APP_THEME.primary, marginTop: 8 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  link: { marginTop: 8 },
  linkLabel: { color: APP_THEME.primary, fontWeight: '700' },
});
