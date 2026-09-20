import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

interface FirebaseAuthValue {
  uid: string | null;
  restoring: boolean;
  isSignedIn: boolean;
  isConfigured: boolean;
}

const DISABLED_AUTH: FirebaseAuthValue = {
  uid: null,
  restoring: false,
  isSignedIn: false,
  isConfigured: false,
};

const FirebaseAuthContext = createContext<FirebaseAuthValue>(DISABLED_AUTH);

// Single-user, single-device app — there's no one to log in as, so identity
// is just whatever anonymous account this install already has (or silently
// creates on first launch). Firebase persists the anonymous credential
// locally (see lib/firebase.ts's RN/web persistence setup), so this uid is
// stable across restarts as long as the app isn't reinstalled or its local
// storage isn't cleared.
export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const currentAuth = auth;
    if (!currentAuth) {
      setRestoring(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(currentAuth, (user: User | null) => {
      if (user) {
        setUid(user.uid);
        setRestoring(false);
      } else {
        signInAnonymously(currentAuth).catch(() => setRestoring(false));
      }
    });
    return unsubscribe;
  }, []);

  const value: FirebaseAuthValue = {
    uid,
    restoring,
    isSignedIn: Boolean(uid),
    isConfigured: isFirebaseConfigured(),
  };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}

export function useFirebaseAuth(): FirebaseAuthValue {
  return useContext(FirebaseAuthContext);
}
