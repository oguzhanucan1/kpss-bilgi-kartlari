import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { APP_THEME } from '../theme';

const STEPS = [
  { key: 'username', title: 'Kullanıcı adı seç', placeholder: 'Örn: ayse_2026', icon: 'at', required: true },
  { key: 'full_name', title: 'Adın Soyadın', placeholder: 'Örn: Ayşe Yılmaz', icon: 'account-outline', required: true },
  { key: 'hedef_yil', title: 'Hedef KPSS yılı', placeholder: 'Örn: 2026', icon: 'calendar-outline', required: false },
] as const;

const USERNAME_REGEX = /^[a-zA-Z0-9_\u00C0-\u024F]{3,30}$/;

export default function AccountSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [hedefYil, setHedefYil] = useState('');
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const value = current.key === 'username' ? username : current.key === 'full_name' ? fullName : hedefYil;
  const setValue = current.key === 'username' ? setUsername : current.key === 'full_name' ? setFullName : setHedefYil;

  const canNext = (() => {
    if (current.required && !value.trim()) return false;
    if (current.key === 'username') return USERNAME_REGEX.test(value.trim());
    return true;
  })();

  const usernameError = current.key === 'username' && value.trim().length > 0 && !USERNAME_REGEX.test(value.trim());

  const handleNext = () => {
    if (!canNext) { if (current.key === 'username') Alert.alert('Geçersiz', '3-30 karakter, harf/rakam/alt çizgi.'); return; }
    if (isLast) handleComplete();
    else setStep((s) => s + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    const { error } = await updateProfile({ username: username.trim(), full_name: fullName.trim() || undefined, hedef_yil: hedefYil.trim() || undefined });
    setLoading(false);
    if (error) Alert.alert('Hata', error.message);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Adım {step + 1} / {STEPS.length}</Text>
        <View style={styles.miniProgress}>
          <View style={[styles.miniProgressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>

        <Text style={styles.pageTitle}>Hesap Kurulumu</Text>
        <Text style={styles.subtitle}>{current.title}</Text>

        <View style={styles.card}>
          <View style={[styles.decoCircle, { borderColor: 'rgba(124,58,237,0.12)' }]} />
          <TextInput
            label={current.title}
            placeholder={current.placeholder}
            mode="outlined"
            value={value}
            onChangeText={setValue}
            disabled={loading}
            autoFocus
            keyboardType={current.key === 'hedef_yil' ? 'number-pad' : 'default'}
            autoCapitalize={current.key === 'full_name' ? 'words' : 'none'}
            autoCorrect={false}
            error={usernameError}
            left={<TextInput.Icon icon={current.icon} />}
            style={styles.input}
            outlineColor={APP_THEME.border}
            activeOutlineColor={APP_THEME.primary}
          />
          {current.key === 'username' && (
            <HelperText type={usernameError ? 'error' : 'info'} visible={value.trim().length > 0}>
              {usernameError ? 'En az 3 karakter, harf/rakam/alt çizgi' : 'Kullanılabilir'}
            </HelperText>
          )}

          <View style={styles.actions}>
            {step > 0 && (
              <Button mode="text" onPress={() => setStep((s) => s - 1)} disabled={loading} textColor={APP_THEME.textMuted2}>Geri</Button>
            )}
            <Button mode="contained" onPress={handleNext} loading={loading} disabled={!canNext || loading} style={styles.nextBtn} contentStyle={styles.nextBtnContent} labelStyle={styles.nextBtnLabel}>
              {isLast ? 'Tamamla' : 'İleri'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: APP_THEME.textMuted2, marginBottom: 8 },
  miniProgress: { width: '100%', height: 6, borderRadius: 3, backgroundColor: APP_THEME.primaryLight, marginBottom: 28 },
  miniProgressFill: { height: '100%', borderRadius: 3, backgroundColor: APP_THEME.primary },
  pageTitle: { fontSize: 32, fontWeight: '800', color: APP_THEME.text, marginBottom: 8, lineHeight: 40 },
  subtitle: { fontSize: 16, color: APP_THEME.textMuted2, marginBottom: 24 },
  card: { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, padding: 24, borderWidth: 1, borderColor: APP_THEME.border, position: 'relative', overflow: 'hidden' },
  decoCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, top: -20, right: -20 },
  input: { marginBottom: 4, backgroundColor: APP_THEME.background },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'flex-end', marginTop: 24 },
  nextBtn: { borderRadius: APP_THEME.radius.button, minWidth: 140, backgroundColor: APP_THEME.primary },
  nextBtnContent: { paddingVertical: 6 },
  nextBtnLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
