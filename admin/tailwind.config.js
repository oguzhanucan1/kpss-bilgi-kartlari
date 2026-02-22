/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      colors: {
        darkblack: {
          300: '#747681',
          400: '#2A313C',
          500: '#23262B',
          600: '#1D1E24',
          700: '#151515',
        },
        success: {
          50: '#D9FBE6',
          100: '#B7FFD1',
          200: '#4ADE80',
          300: '#22C55E',
          400: '#16A34A',
        },
        error: {
          50: '#FCDEDE',
          100: '#FF7171',
          200: '#FF4747',
          300: '#DD3333',
        },
        bgray: {
          50: '#FAFAFA',
          100: '#F7FAFC',
          200: '#EDF2F7',
          300: '#E2E8F0',
          400: '#CBD5E0',
          500: '#A0AEC0',
          600: '#718096',
          700: '#4A5568',
          800: '#2D3748',
          900: '#1A202C',
        },
      },
      borderRadius: {
        20: '20px',
      },
    },
  },
  plugins: [],
};
