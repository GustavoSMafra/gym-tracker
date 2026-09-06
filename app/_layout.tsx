import '../global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider } from '../lib/ToastContext';
import { GymDataProvider } from '../lib/GymDataContext';
import { GoogleAuthProvider } from '../lib/googleAuth';
import { ToastHost } from '../components/ui/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ToastProvider>
          <GoogleAuthProvider>
            <GymDataProvider>
              <View className="flex-1 bg-background">
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="session/[workoutId]" options={{ presentation: 'fullScreenModal' }} />
                  <Stack.Screen name="session/summary/[sessionId]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
                </Stack>
                <ToastHost />
              </View>
            </GymDataProvider>
          </GoogleAuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
