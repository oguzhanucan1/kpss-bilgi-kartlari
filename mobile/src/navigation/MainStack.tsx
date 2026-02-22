import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types';
import SubjectSelectScreen from '../screens/SubjectSelectScreen';
import TopicSelectScreen from '../screens/TopicSelectScreen';
import CardsScreen from '../screens/CardsScreen';
import TestScreen from '../screens/TestScreen';
import BildirimListesiScreen from '../screens/BildirimListesiScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SubjectSelect" component={SubjectSelectScreen} />
      <Stack.Screen name="TopicSelect" component={TopicSelectScreen} />
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="BildirimListesi" component={BildirimListesiScreen} />
    </Stack.Navigator>
  );
}
