import type { ConfigContext, ExpoConfig } from 'expo/config';

// Google OAuth client IDs, one per platform, are provided via env vars at build
// time (see CLAUDE.md "DEV — Implementation" for the full list). They are not
// committed — a real deployment must supply its own via `.env` / EAS secrets.
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
  plugins: ['expo-router', 'expo-status-bar', 'expo-web-browser'],
  extra: {
    googleOAuth: {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    },
  },
});
