import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Exercise, GymTrackerData, Workout, WorkoutExercise, WorkoutSession } from './types';
import { emptyData, loadLocalData, saveLocalData } from './storage';
import { seedExercises } from './seedExercises';
import { generateId } from './id';
import { useFirebaseAuth } from './firebaseAuth';
import { downloadRemoteData, mergeByRecency, uploadRemoteData } from './firestoreSync';
import { useToast } from './ToastContext';

interface GymDataContextValue {
  data: GymTrackerData;
  loading: boolean;
  isSignedIn: boolean;
  isFirebaseConfigured: boolean;
  setWeeklyGoal: (goal: number) => void;
  addCustomExercise: (name: string, muscleGroup: string) => Exercise;
  createWorkout: (name: string, description: string | undefined, exercises: WorkoutExercise[]) => Workout;
  updateWorkout: (id: string, name: string, description: string | undefined, exercises: WorkoutExercise[]) => void;
  deleteWorkout: (id: string) => void;
  logSession: (session: Omit<WorkoutSession, 'id'>) => WorkoutSession;
}

const GymDataContext = createContext<GymDataContextValue | null>(null);

export function GymDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<GymTrackerData>(emptyData());
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;
  const { showToast } = useToast();
  const auth = useFirebaseAuth();
  const syncingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const existing = await loadLocalData();
      if (existing) {
        setData(existing);
      } else {
        // updatedAt intentionally stays at emptyData()'s epoch value (not
        // "now") — this placeholder must always lose the last-write-wins
        // merge in reconcile() to any real remote data. Stamping it "now"
        // caused a real data-loss bug: after any local-storage wipe (app
        // reinstall, new device, cleared site data), this freshly-reseeded
        // empty document was "newer" than the genuine remote save and
        // silently overwrote it on the very next reconcile.
        const seeded: GymTrackerData = {
          ...emptyData(),
          exercises: seedExercises(generateId, new Date().toISOString()),
        };
        setData(seeded);
        await saveLocalData(seeded);
      }
      setLoading(false);
    })();
  }, []);

  async function reconcile() {
    if (!auth.uid || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const remote = await downloadRemoteData(auth.uid);
      const merged = remote ? mergeByRecency(dataRef.current, remote) : dataRef.current;
      if (merged !== dataRef.current) {
        setData(merged);
        await saveLocalData(merged);
      }
      await uploadRemoteData(auth.uid, merged);
    } catch {
      showToast('Sync failed — working offline, will retry', 'info');
    } finally {
      syncingRef.current = false;
    }
  }

  useEffect(() => {
    if (auth.isSignedIn) reconcile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isSignedIn]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reconcile();
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.uid]);

  function mutate(updater: (current: GymTrackerData) => GymTrackerData) {
    const next = { ...updater(dataRef.current), updatedAt: new Date().toISOString() };
    setData(next);
    saveLocalData(next).catch(() => showToast('Could not save locally', 'error'));
    if (auth.uid) {
      uploadRemoteData(auth.uid, next).catch(() => showToast('Sync failed — working offline, will retry', 'info'));
    }
    return next;
  }

  function setWeeklyGoal(goal: number) {
    mutate((current) => ({ ...current, settings: { ...current.settings, weeklyGoal: goal } }));
  }

  function addCustomExercise(name: string, muscleGroup: string): Exercise {
    const exercise: Exercise = {
      id: generateId(),
      name: name.trim(),
      muscleGroup: muscleGroup.trim() || 'Other',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    mutate((current) => ({ ...current, exercises: [...current.exercises, exercise] }));
    return exercise;
  }

  function createWorkout(name: string, description: string | undefined, exercises: WorkoutExercise[]): Workout {
    const now = new Date().toISOString();
    const workout: Workout = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim() || undefined,
      exercises,
      createdAt: now,
      updatedAt: now,
    };
    mutate((current) => ({ ...current, workouts: [...current.workouts, workout] }));
    return workout;
  }

  function updateWorkout(id: string, name: string, description: string | undefined, exercises: WorkoutExercise[]) {
    mutate((current) => ({
      ...current,
      workouts: current.workouts.map((w) =>
        w.id === id
          ? { ...w, name: name.trim(), description: description?.trim() || undefined, exercises, updatedAt: new Date().toISOString() }
          : w
      ),
    }));
  }

  function deleteWorkout(id: string) {
    mutate((current) => ({ ...current, workouts: current.workouts.filter((w) => w.id !== id) }));
  }

  function logSession(session: Omit<WorkoutSession, 'id'>): WorkoutSession {
    const full: WorkoutSession = { ...session, id: generateId() };
    mutate((current) => ({ ...current, sessions: [...current.sessions, full] }));
    return full;
  }

  return (
    <GymDataContext.Provider
      value={{
        data,
        loading,
        isSignedIn: auth.isSignedIn,
        isFirebaseConfigured: auth.isConfigured,
        setWeeklyGoal,
        addCustomExercise,
        createWorkout,
        updateWorkout,
        deleteWorkout,
        logSession,
      }}
    >
      {children}
    </GymDataContext.Provider>
  );
}

export function useGymData(): GymDataContextValue {
  const ctx = useContext(GymDataContext);
  if (!ctx) throw new Error('useGymData must be used within GymDataProvider');
  return ctx;
}
