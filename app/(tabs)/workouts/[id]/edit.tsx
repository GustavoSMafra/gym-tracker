import React from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WorkoutForm } from '../../../../components/WorkoutForm';
import { useGymData } from '../../../../lib/GymDataContext';
import { useToast } from '../../../../lib/ToastContext';
import type { WorkoutExercise } from '../../../../lib/types';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateWorkout } = useGymData();
  const { showToast } = useToast();

  const workout = data.workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-white/60">Workout not found.</Text>
      </View>
    );
  }

  function handleSubmit(name: string, description: string | undefined, exercises: WorkoutExercise[]) {
    updateWorkout(workout!.id, name, description, exercises);
    showToast('Workout updated', 'success');
    router.back();
  }

  return (
    <WorkoutForm
      initialName={workout.name}
      initialDescription={workout.description}
      initialExercises={workout.exercises.map((ex) => ({
        ...ex,
        exerciseName: data.exercises.find((e) => e.id === ex.exerciseId)?.name ?? 'Unknown',
      }))}
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
    />
  );
}
