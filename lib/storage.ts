import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GymTrackerData } from './types';

const STORAGE_KEY = 'gym-tracker-data';

export function emptyData(): GymTrackerData {
  return {
    version: 1,
    settings: { weeklyGoal: 3 },
    exercises: [],
    workouts: [],
    sessions: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export async function loadLocalData(): Promise<GymTrackerData | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GymTrackerData;
  } catch {
    return null;
  }
}

export async function saveLocalData(data: GymTrackerData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
