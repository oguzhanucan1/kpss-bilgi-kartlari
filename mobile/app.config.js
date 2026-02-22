const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (_) {}
const config = require('./app.json');
module.exports = {
  ...config,
  expo: {
    ...config.expo,
    scheme: 'kpss-bilgi-karti',
    plugins: ['expo-font'],
  },
  extra: {
    supabaseUrl: String(process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim(),
    supabaseAnonKey: String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  },
};
