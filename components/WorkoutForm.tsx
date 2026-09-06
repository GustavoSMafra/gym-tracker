import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TrashIcon } from './icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ExercisePicker } from './ExercisePicker';
import { useGymData } from '../lib/GymDataContext';
import { useToast } from '../lib/ToastContext';
import type { Exercise, WorkoutExercise } from '../lib/types';

export interface DraftExercise extends WorkoutExercise {
  exerciseName: string;
}

interface WorkoutFormProps {
  initialName?: string;
  initialDescription?: string;
  initialExercises?: DraftExercise[];
  submitLabel: string;
  onSubmit: (name: string, description: string | undefined, exercises: WorkoutExercise[]) => void;
}

export function WorkoutForm({
  initialName = '',
  initialDescription = '',
  initialExercises = [],
  submitLabel,
  onSubmit,
}: WorkoutFormProps) {
  const { data } = useGymData();
  const { showToast } = useToast();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [exercises, setExercises] = useState<DraftExercise[]>(initialExercises);
  const [pickerVisible, setPickerVisible] = useState(false);

  function handleSelectExercise(exercise: Exercise) {
    setExercises((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        order: current.length,
        targetSets: 3,
        targetReps: 10,
      },
    ]);
    setPickerVisible(false);
  }

  function updateExercise(index: number, patch: Partial<DraftExercise>) {
    setExercises((current) => current.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  }

  function removeExercise(index: number) {
    setExercises((current) =>
      current.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i }))
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      showToast('Workout name is required', 'error');
      return;
    }
    if (exercises.length === 0) {
      showToast('Add at least one exercise', 'error');
      return;
    }
    onSubmit(
      name,
      description,
      exercises.map(({ exerciseName, ...rest }) => rest)
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Input label="Name" placeholder="e.g. Push Day" value={name} onChangeText={setName} />
      <Input
        label="Description (optional)"
        placeholder="Notes about this workout"
        value={description}
        onChangeText={setDescription}
      />

      <Text className="font-bodyMedium text-sm text-white/70">Exercises</Text>
      {exercises.map((ex, index) => (
        <Card key={`${ex.exerciseId}-${index}`} className="rounded-[22px]">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-bodyBold text-base text-white">{ex.exerciseName}</Text>
            <Pressable onPress={() => removeExercise(index)} hitSlop={8}>
              <TrashIcon size={18} color="#f87171" />
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                label="Sets"
                keyboardType="number-pad"
                value={String(ex.targetSets)}
                onChangeText={(v) => updateExercise(index, { targetSets: Number(v) || 0 })}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Reps"
                keyboardType="number-pad"
                value={String(ex.targetReps)}
                onChangeText={(v) => updateExercise(index, { targetReps: Number(v) || 0 })}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Weight (kg)"
                keyboardType="number-pad"
                value={ex.targetWeight ? String(ex.targetWeight) : ''}
                onChangeText={(v) => updateExercise(index, { targetWeight: v ? Number(v) : undefined })}
              />
            </View>
          </View>
        </Card>
      ))}

      <Button label="Add Exercise" variant="secondary" onPress={() => setPickerVisible(true)} />

      <View className="mt-4">
        <Button label={submitLabel} onPress={handleSubmit} />
      </View>

      <ExercisePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectExercise}
      />
    </ScrollView>
  );
}
