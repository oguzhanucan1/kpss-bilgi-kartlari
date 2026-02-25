const path = require('path');
// .env'i hem mobile/ hem proje kökünden dene (npm start nereden çalıştırılırsa çalışsın)
require('dotenv').config({ path: path.join(__dirname, '.env') });
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  require('dotenv').config({ path: path.join(process.cwd(), '.env') });
}
const config = require('./app.json');
module.exports = {
  ...config,
  expo: {
    ...config.expo,
    scheme: 'kpss-bilgi-karti',
    plugins: ['expo-font'],
    android: {
      ...config.expo.android,
      package: 'com.kpssbilgikarti.mobile',
      softwareKeyboardLayoutMode: 'pan',
    },
    updates: {
      url: 'https://u.expo.dev/1fc63e3c-6f11-43c5-a3fa-ae20a5ac25d7',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      eas: {
        projectId: '1fc63e3c-6f11-43c5-a3fa-ae20a5ac25d7',
      },
      supabaseUrl: String(process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim(),
      supabaseAnonKey: String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || '').trim(),
    },
  },
};
