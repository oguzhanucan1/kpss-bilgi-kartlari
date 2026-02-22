import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MainStack from './MainStack';
import ProfileStack from './ProfileStack';
import AnalizScreen from '../screens/AnalizScreen';
import KaydedilenScreen from '../screens/KaydedilenScreen';
import { APP_THEME } from '../theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: APP_THEME.surface,
          borderTopColor: APP_THEME.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom || 10,
          height: tabBarHeight,
          elevation: 12,
          shadowColor: APP_THEME.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: APP_THEME.primary,
        tabBarInactiveTintColor: APP_THEME.textMuted2,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="AnasayfaTab"
        component={MainStack}
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analiz"
        component={AnalizScreen}
        options={{
          title: 'Analiz',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name={focused ? 'chart-line' : 'chart-line'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Kaydedilen"
        component={KaydedilenScreen}
        options={{
          title: 'Kaydedilen',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileStack}
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
