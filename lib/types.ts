export interface GymTrackerData {
  version: 1;
  settings: {
    weeklyGoal: number;
  };
  exercises: Exercise[];
  workouts: Workout[];
  sessions: WorkoutSession[];
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  restSeconds?: number;
}

export interface WorkoutSession {
  id: string;
  workoutId?: string;
  workoutName: string;
  date: string;
  startedAt: string;
  completedAt?: string;
  exercises: PerformedExercise[];
  notes?: string;
}

export interface PerformedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: PerformedSet[];
}

export interface PerformedSet {
  setNumber: number;
  reps: number;
  weight: number;
}
