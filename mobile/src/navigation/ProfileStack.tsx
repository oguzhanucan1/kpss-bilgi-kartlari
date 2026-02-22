import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import ProfilScreen from '../screens/ProfilScreen';
import HesapBilgileriScreen from '../screens/HesapBilgileriScreen';
import BildirimlerScreen from '../screens/BildirimlerScreen';
import GizlilikScreen from '../screens/GizlilikScreen';
import YardimDestekScreen from '../screens/YardimDestekScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Profil" component={ProfilScreen} />
      <Stack.Screen name="HesapBilgileri" component={HesapBilgileriScreen} />
      <Stack.Screen name="Bildirimler" component={BildirimlerScreen} />
      <Stack.Screen name="Gizlilik" component={GizlilikScreen} />
      <Stack.Screen name="YardimDestek" component={YardimDestekScreen} />
    </Stack.Navigator>
  );
}
