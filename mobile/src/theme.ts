/**
 * Anasayfa ile uyumlu uygulama geneli tema renkleri ve stiller
 * Lexend: https://fonts.google.com/specimen/Lexend
 */
export const APP_THEME = {
  fontFamily: 'Lexend_400Regular',
  fontFamilyBold: 'Lexend_700Bold',
  background: '#F3EDF7',
  surface: '#FFFFFF',
  primary: '#7C3AED',
  primaryLight: 'rgba(124,58,237,0.15)',
  text: '#1E293B',
  textMuted: 'rgba(30,41,59,0.6)',
  textMuted2: '#64748B',
  border: '#E2E8F0',
  cardPastel: ['#B8D8C8', '#C8B8D8', '#B8C8D8', '#D8D0B8', '#E8E0F0'] as const,
  radius: { card: 24, button: 16, input: 14, small: 12 },
  shadow: {
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    button: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  },
};
