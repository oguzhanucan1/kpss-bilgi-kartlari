import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import AccountSetupScreen from '../screens/AccountSetupScreen';
import AppSessionTracker from '../context/AppSessionTracker';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootNavigator() {
  const { session, loading, isSetupComplete } = useAuth();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        {!session ? <AuthStack /> : !isSetupComplete ? <AccountSetupScreen /> : (
          <>
            <MainTabs />
            <AppSessionTracker />
          </>
        )}
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
