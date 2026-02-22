import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={APP_THEME.background} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="school" size={40} color="#fff" />
            </View>
          </View>

          <Text style={styles.headline}>KPSS hazırlığında{'\n'}yanındayız</Text>
          <Text style={styles.sub}>Binlerce bilgi kartı ile sınavına en verimli şekilde hazırlan.</Text>

          <View style={styles.card}>
            <View style={[styles.decoCircle, { borderColor: 'rgba(124,58,237,0.15)' }]} />
            <Button mode="contained" onPress={() => navigation.navigate('Register')} contentStyle={styles.primaryContent} labelStyle={styles.primaryLabel} icon="arrow-right" style={styles.primaryBtn}>
              Hemen Başla
            </Button>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={({ pressed }) => [styles.socialCard, pressed && styles.cardPressed]} onPress={() => navigation.navigate('Register')}>
            <View style={styles.socialIconWrap}>
              <MaterialCommunityIcons name="google" size={22} color={APP_THEME.text} />
            </View>
            <Text style={styles.socialLabel}>Google ile Devam Et</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.socialCard, pressed && styles.cardPressed]} onPress={() => navigation.navigate('Register')}>
            <View style={styles.socialIconWrap}>
              <MaterialCommunityIcons name="apple" size={22} color={APP_THEME.text} />
            </View>
            <Text style={styles.socialLabel}>Apple ile Devam Et</Text>
          </Pressable>

          <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.loginLink} labelStyle={styles.loginLinkLabel}>
            Zaten hesabın var mı? Giriş Yap
          </Button>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.background },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40, alignItems: 'center' },
  logoWrap: { marginBottom: 28 },
  logoIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: APP_THEME.primary, alignItems: 'center', justifyContent: 'center', ...APP_THEME.shadow.button },
  headline: { fontSize: 32, fontWeight: '800', color: APP_THEME.text, lineHeight: 40, textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 16, color: APP_THEME.textMuted2, textAlign: 'center', lineHeight: 24, marginBottom: 28, paddingHorizontal: 12 },
  card: { width: '100%', backgroundColor: APP_THEME.cardPastel[4], borderRadius: APP_THEME.radius.card, padding: 24, marginBottom: 20, overflow: 'hidden', position: 'relative', minHeight: 100 },
  decoCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, top: -30, right: -30 },
  cardPressed: { opacity: 0.95 },
  primaryBtn: { borderRadius: APP_THEME.radius.button, backgroundColor: APP_THEME.primary },
  primaryContent: { paddingVertical: 8, flexDirection: 'row-reverse' },
  primaryLabel: { fontSize: 17, fontWeight: '700', color: '#fff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: APP_THEME.border },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: APP_THEME.textMuted2 },
  socialCard: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: APP_THEME.border },
  socialIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: APP_THEME.background, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  socialLabel: { fontSize: 16, fontWeight: '600', color: APP_THEME.text, flex: 1 },
  loginLink: { marginTop: 16 },
  loginLinkLabel: { color: APP_THEME.primary, fontWeight: '700', fontSize: 15 },
});
