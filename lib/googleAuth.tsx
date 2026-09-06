import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_STORAGE_KEY = 'gym-tracker-google-access-token';

// drive.file: the app can only read/write files it created itself — never
// broad access to the user's whole Drive.
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const googleOAuth = (Constants.expoConfig?.extra?.googleOAuth ?? {}) as {
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
};

export function isGoogleAuthConfigured(): boolean {
  return Boolean(googleOAuth.iosClientId || googleOAuth.androidClientId || googleOAuth.webClientId);
}

interface GoogleAuthValue {
  accessToken: string | null;
  restoring: boolean;
  isSignedIn: boolean;
  isConfigured: boolean;
  signIn: () => void;
  signOut: () => void;
}

const DISABLED_AUTH: GoogleAuthValue = {
  accessToken: null,
  restoring: false,
  isSignedIn: false,
  isConfigured: false,
  signIn: () => {},
  signOut: () => {},
};

const GoogleAuthContext = createContext<GoogleAuthValue>(DISABLED_AUTH);

// expo-auth-session's Google provider calls `Google.useAuthRequest` — on web
// this throws synchronously (invariantClientId) if webClientId is undefined,
// rather than returning a disabled/null request. So it must never be called
// with partial/missing config. This component only mounts when at least one
// client ID is configured, which keeps the hook call unconditional within
// this component while the app as a whole supports running with none set.
function ConfiguredGoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: googleOAuth.iosClientId || undefined,
    androidClientId: googleOAuth.androidClientId || undefined,
    webClientId: googleOAuth.webClientId || undefined,
    scopes: [DRIVE_FILE_SCOPE],
  });

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_STORAGE_KEY)
      .then((token) => setAccessToken(token))
      .finally(() => setRestoring(false));
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const token = response.authentication.accessToken;
      setAccessToken(token);
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, token).catch(() => {});
    }
  }, [response]);

  async function signOut() {
    setAccessToken(null);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  const value: GoogleAuthValue = {
    accessToken,
    restoring,
    isSignedIn: Boolean(accessToken),
    isConfigured: true,
    signIn: () => promptAsync(),
    signOut,
  };

  return <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>;
}

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  if (!isGoogleAuthConfigured()) {
    return <GoogleAuthContext.Provider value={DISABLED_AUTH}>{children}</GoogleAuthContext.Provider>;
  }
  return <ConfiguredGoogleAuthProvider>{children}</ConfiguredGoogleAuthProvider>;
}

export function useGoogleAuth(): GoogleAuthValue {
  return useContext(GoogleAuthContext);
}
