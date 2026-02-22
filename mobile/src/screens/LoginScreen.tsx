import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

const DEMO_EMAIL = 'demo@kpss.app';
const DEMO_PASSWORD = 'Demo123!';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email.trim() || !password) { Alert.alert('Hata', 'E-posta ve şifre girin.'); return; }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Giriş hatası', error.message);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    setLoading(false);
    if (error) Alert.alert('Demo giriş', 'Demo kullanıcı bulunamadı.');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} style={styles.backBtn} iconColor={APP_THEME.text} />

        <Text style={styles.pageTitle}>Hoş Geldin</Text>
        <Text style={styles.subtitle}>Hesabına giriş yap</Text>

        <View style={styles.card}>
          <View style={[styles.decoCircle, { borderColor: 'rgba(124,58,237,0.12)' }]} />
          <TextInput label="E-posta" mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" disabled={loading} style={styles.input} left={<TextInput.Icon icon="email-outline" />} outlineColor={APP_THEME.border} activeOutlineColor={APP_THEME.primary} />
          <TextInput label="Şifre" mode="outlined" value={password} onChangeText={setPassword} secureTextEntry={secureText} disabled={loading} style={styles.input} left={<TextInput.Icon icon="lock-outline" />} right={<TextInput.Icon icon={secureText ? 'eye-off-outline' : 'eye-outline'} onPress={() => setSecureText(!secureText)} />} outlineColor={APP_THEME.border} activeOutlineColor={APP_THEME.primary} />
          <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={styles.primaryBtn} contentStyle={styles.btnContent} labelStyle={styles.btnLabel}>
            Giriş Yap
          </Button>
          <Button mode="outlined" onPress={handleDemoLogin} disabled={loading} style={styles.demoBtn} contentStyle={styles.btnContent} icon="flash" labelStyle={styles.demoBtnLabel}>
            Demo ile Giriş Yap
          </Button>
        </View>

        <Button mode="text" onPress={() => navigation.replace('Register')} disabled={loading} style={styles.link} labelStyle={styles.linkLabel}>
          Hesabınız yok mu? Kayıt olun
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
  demoBtn: { borderRadius: APP_THEME.radius.button, marginTop: 12, borderColor: APP_THEME.primary, borderWidth: 1.5 },
  demoBtnLabel: { color: APP_THEME.primary, fontWeight: '600' },
  link: { marginTop: 8 },
  linkLabel: { color: APP_THEME.primary, fontWeight: '700' },
});
