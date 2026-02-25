import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl = (Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '').trim();

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = client;
