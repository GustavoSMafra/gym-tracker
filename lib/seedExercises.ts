import type { Exercise } from './types';

const SEED: Array<[string, string]> = [
  ['Barbell Back Squat', 'Legs'],
  ['Deadlift', 'Back'],
  ['Bench Press', 'Chest'],
  ['Overhead Press', 'Shoulders'],
  ['Barbell Row', 'Back'],
  ['Pull-Up', 'Back'],
  ['Dip', 'Chest'],
  ['Romanian Deadlift', 'Legs'],
  ['Leg Press', 'Legs'],
  ['Dumbbell Curl', 'Arms'],
  ['Triceps Pushdown', 'Arms'],
  ['Lateral Raise', 'Shoulders'],
  ['Plank', 'Core'],
  ['Hip Thrust', 'Legs'],
  ['Lat Pulldown', 'Back'],
];

export function seedExercises(idFactory: () => string, now: string): Exercise[] {
  return SEED.map(([name, muscleGroup]) => ({
    id: idFactory(),
    name,
    muscleGroup,
    isCustom: false,
    createdAt: now,
  }));
}
