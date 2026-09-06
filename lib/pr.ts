import type { WorkoutSession } from './types';

export interface ExercisePR {
  exerciseId: string;
  exerciseName: string;
  bestWeight: { weight: number; reps: number; date: string };
  bestEstimated1RM: { estimated1RM: number; weight: number; reps: number; date: string };
}

export function estimatedOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

export function derivePRs(sessions: WorkoutSession[]): ExercisePR[] {
  const byExercise = new Map<string, ExercisePR>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (set.reps <= 0) continue;
        const estimated1RM = estimatedOneRepMax(set.weight, set.reps);
        const existing = byExercise.get(exercise.exerciseId);

        if (!existing) {
          byExercise.set(exercise.exerciseId, {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            bestWeight: { weight: set.weight, reps: set.reps, date: session.date },
            bestEstimated1RM: { estimated1RM, weight: set.weight, reps: set.reps, date: session.date },
          });
          continue;
        }

        if (set.weight > existing.bestWeight.weight) {
          existing.bestWeight = { weight: set.weight, reps: set.reps, date: session.date };
        }
        if (estimated1RM > existing.bestEstimated1RM.estimated1RM) {
          existing.bestEstimated1RM = { estimated1RM, weight: set.weight, reps: set.reps, date: session.date };
        }
      }
    }
  }

  return Array.from(byExercise.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

export interface PRHistoryPoint {
  date: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  isPR: boolean;
}

export function prHistoryForExercise(sessions: WorkoutSession[], exerciseId: string): PRHistoryPoint[] {
  const points: PRHistoryPoint[] = [];
  let bestSoFar = 0;

  const relevantSessions = [...sessions]
    .filter((s) => s.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const session of relevantSessions) {
    const exercise = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exercise) continue;
    for (const set of exercise.sets) {
      if (set.reps <= 0) continue;
      const estimated1RM = estimatedOneRepMax(set.weight, set.reps);
      const isPR = estimated1RM > bestSoFar;
      if (isPR) bestSoFar = estimated1RM;
      points.push({ date: session.date, weight: set.weight, reps: set.reps, estimated1RM, isPR });
    }
  }

  return points.filter((p) => p.isPR);
}

export function totalVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0
  );
}

// undefined for a session with no completedAt — shouldn't happen since
// sessions are only ever saved via handleFinish, but callers should be
// defensive rather than assume every session has a duration.
export function sessionDurationMinutes(session: WorkoutSession): number | undefined {
  if (!session.completedAt) return undefined;
  const ms = new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}
