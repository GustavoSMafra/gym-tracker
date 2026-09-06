import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Exercise, GymTrackerData, Workout, WorkoutExercise, WorkoutSession } from './types';
import { emptyData, loadLocalData, saveLocalData } from './storage';
import { seedExercises } from './seedExercises';
import { generateId } from './id';
import { useGoogleAuth } from './googleAuth';
import { downloadRemoteData, mergeByRecency, uploadRemoteData } from './driveSync';
import { useToast } from './ToastContext';

interface GymDataContextValue {
  data: GymTrackerData;
  loading: boolean;
  isSignedIn: boolean;
  isGoogleConfigured: boolean;
  signIn: () => void;
  signOut: () => void;
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
  const auth = useGoogleAuth();
  const syncingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const existing = await loadLocalData();
      if (existing) {
        setData(existing);
      } else {
        const now = new Date().toISOString();
        const seeded: GymTrackerData = {
          ...emptyData(),
          exercises: seedExercises(generateId, now),
          updatedAt: now,
        };
        setData(seeded);
        await saveLocalData(seeded);
      }
      setLoading(false);
    })();
  }, []);

  async function reconcile() {
    if (!auth.accessToken || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const remote = await downloadRemoteData(auth.accessToken);
      const merged = remote ? mergeByRecency(dataRef.current, remote) : dataRef.current;
      if (merged !== dataRef.current) {
        setData(merged);
        await saveLocalData(merged);
      }
      await uploadRemoteData(auth.accessToken, merged);
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
  }, [auth.accessToken]);

  function mutate(updater: (current: GymTrackerData) => GymTrackerData) {
    const next = { ...updater(dataRef.current), updatedAt: new Date().toISOString() };
    setData(next);
    saveLocalData(next).catch(() => showToast('Could not save locally', 'error'));
    if (auth.accessToken) {
      uploadRemoteData(auth.accessToken, next).catch(() => showToast('Sync failed — working offline, will retry', 'info'));
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
        isGoogleConfigured: auth.isConfigured,
        signIn: () => auth.signIn(),
        signOut: () => auth.signOut(),
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
