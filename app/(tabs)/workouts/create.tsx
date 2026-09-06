import React from 'react';
import { router } from 'expo-router';
import { WorkoutForm } from '../../../components/WorkoutForm';
import { useGymData } from '../../../lib/GymDataContext';
import { useToast } from '../../../lib/ToastContext';
import type { WorkoutExercise } from '../../../lib/types';

export default function CreateWorkoutScreen() {
  const { createWorkout } = useGymData();
  const { showToast } = useToast();

  function handleSubmit(name: string, description: string | undefined, exercises: WorkoutExercise[]) {
    createWorkout(name, description, exercises);
    showToast('Workout created', 'success');
    // replace (not back): this screen can be reached by a cross-tab push
    // (e.g. Dashboard's empty-state CTA), in which case back() leaves this
    // tab's nested stack still parked on "create" — replace resets it to
    // the tab's list so a later tap on the Workouts tab shows the list, not
    // a stale, already-submitted form.
    router.replace('/workouts');
  }

  return <WorkoutForm submitLabel="Create Workout" onSubmit={handleSubmit} />;
}
