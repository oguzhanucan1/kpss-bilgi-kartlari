import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

/** Expo push token alır ve Supabase push_tokens tablosuna kaydeder. */
export async function registerPushTokenForUser(userId: string): Promise<boolean> {
  if (!supabase || !Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? undefined;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });
    const token = tokenData.data;
    if (!token) return false;

    await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        token,
        token_type: 'expo',
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    return true;
  } catch {
    return false;
  }
}
