import type { ConfigContext, ExpoConfig } from 'expo/config';

// Firebase project config is provided via env vars at build time (see
// CLAUDE.md "DEV — Implementation" for the full list). Not committed — a real
// deployment must supply its own via `.env` / EAS secrets.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Gym Tracker',
  slug: 'gym-tracker',
  scheme: 'gymtracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gymtracker.app',
  },
  android: {
    package: 'com.gymtracker.app',
    adaptiveIcon: {
      backgroundColor: '#312D33',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-status-bar'],
  extra: {
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    },
  },
});
