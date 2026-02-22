import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    videoRef.current?.playAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Video
        ref={videoRef}
        source={require('../../assets/videos/welcome-bg.mp4')}
        style={styles.video}
        resizeMode="cover"
        isLooping
        isMuted
        shouldPlay
      />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.logoWrap}>
              <View style={styles.logoIcon}>
                <MaterialCommunityIcons name="school" size={44} color="#fff" />
              </View>
            </View>

            <Text style={styles.headline}>KPSS hazırlığında{'\n'}yanındayız</Text>
            <Text style={styles.sub}>Binlerce bilgi kartı ile sınavına en verimli şekilde hazırlan.</Text>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Register')}
                contentStyle={styles.primaryContent}
                labelStyle={styles.primaryLabel}
                icon="arrow-right"
                style={styles.primaryBtn}
              >
                Hemen Başla
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Login')}
                contentStyle={styles.secondaryContent}
                labelStyle={styles.secondaryLabel}
                style={styles.secondaryBtn}
              >
                Giriş Yap
              </Button>
            </View>

            <Text style={styles.footerHint}>Ücretsiz hesap oluştur, kartlarla çalışmaya başla.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  logoWrap: { marginBottom: 32 },
  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...APP_THEME.shadow?.button,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  actions: { width: '100%', gap: 14, marginBottom: 28 },
  primaryBtn: {
    borderRadius: APP_THEME.radius.button,
    backgroundColor: APP_THEME.primary,
    borderWidth: 0,
  },
  primaryContent: { paddingVertical: 6, flexDirection: 'row-reverse' },
  primaryLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    borderRadius: APP_THEME.radius.button,
    borderColor: '#fff',
    borderWidth: 2,
  },
  secondaryContent: { paddingVertical: 6 },
  secondaryLabel: { fontSize: 16, fontWeight: '600', color: '#fff' },
  footerHint: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
});
