import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
// `@firebase/auth`'s exports map lists a platform-agnostic "types" entry
// before its "react-native"-conditioned one, so tsc always resolves the
// cross-platform d.ts and never sees this RN-only helper — even with
// `customConditions: ["react-native"]` set (see expo/tsconfig.base). Pulled
// in as an untyped namespace import so the *type* comes from `firebase/auth`
// (above) while Metro resolves the *value* to the real RN build at
// bundle/runtime — see CLAUDE.md "Notable implementation details".
import * as FirebaseAuthCore from '@firebase/auth';
const getReactNativePersistence = (
  FirebaseAuthCore as unknown as { getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence }
).getReactNativePersistence;

const firebaseConfig = (Constants.expoConfig?.extra?.firebase ?? {}) as Partial<FirebaseOptions>;

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// Only initialize the SDK when a real config is present — mirrors the
// conditional-mount pattern in firebaseAuth.tsx, keeping local-only mode
// (no .env configured) from ever touching the Firebase SDK.
const app = isFirebaseConfigured() ? initializeApp(firebaseConfig as FirebaseOptions) : null;

// Firestore's default long-polling transport works unchanged in React Native;
// Auth needs an explicit AsyncStorage-backed persistence on native (getAuth's
// default persistence is web-only and warns/loses session on RN).
export const auth: Auth | null = app
  ? Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : null;

// `GymTrackerData` has several optional fields (Workout.description,
// WorkoutExercise.targetWeight/restSeconds, etc.) that are explicitly set to
// `undefined` rather than omitted. The old Drive sync serialized via
// JSON.stringify, which silently drops undefined keys — Firestore's setDoc
// throws on them by default ("Unsupported field value: undefined"). This
// option restores the JSON.stringify-like behavior instead of having to
// sanitize every write call site.
export const db: Firestore | null = app ? initializeFirestore(app, { ignoreUndefinedProperties: true }) : null;
