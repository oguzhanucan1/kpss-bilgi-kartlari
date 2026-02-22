import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme, configureFonts } from 'react-native-paper';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import ConfigRequiredScreen from './src/screens/ConfigRequiredScreen';
import { isSupabaseConfigured } from './src/lib/supabase';

const LEXEND_FONT = 'Lexend_400Regular';

function buildTheme() {
  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#7C3AED',
      primaryContainer: '#E8E0F0',
      secondary: '#7C3AED',
      secondaryContainer: '#E8E0F0',
      surface: '#FFFFFF',
      surfaceVariant: '#F3EDF7',
      background: '#F3EDF7',
      error: '#EF4444',
      onPrimary: '#FFFFFF',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      outline: '#E2E8F0',
      elevation: {
        level0: 'transparent',
        level1: '#FFFFFF',
        level2: '#F8FAFC',
        level3: '#F1F5F9',
        level4: '#E2E8F0',
        level5: '#CBD5E1',
      },
    },
    roundness: 14,
    fonts: configureFonts({
      config: { fontFamily: LEXEND_FONT },
    }),
  };
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Bir hata oluştu</Text>
          <Text style={errorStyles.message}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8, fontFamily: LEXEND_FONT },
  message: { fontSize: 14, color: '#64748B', textAlign: 'center', fontFamily: LEXEND_FONT },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const theme = React.useMemo(() => buildTheme(), []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3EDF7' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <ConfigRequiredScreen />
          <StatusBar style="dark" />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ErrorBoundary>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </AuthProvider>
        </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
