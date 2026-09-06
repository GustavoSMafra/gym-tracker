import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGymData } from '../../lib/GymDataContext';
import { useToast } from '../../lib/ToastContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ExercisePicker } from '../../components/ExercisePicker';
import { CheckIcon, CloseIcon, TrashIcon } from '../../components/icons';
import { derivePRs } from '../../lib/pr';
import { formatElapsedClock } from '../../lib/dateUtils';
import type { Exercise, PerformedExercise, PerformedSet } from '../../lib/types';

interface DraftSet extends PerformedSet {
  completed: boolean;
}

interface DraftPerformedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: DraftSet[];
}

export default function SessionLogScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { data, logSession } = useGymData();
  const { showToast } = useToast();

  const workout = data.workouts.find((w) => w.id === workoutId);
  const [startedAt] = useState(new Date().toISOString());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [exercises, setExercises] = useState<DraftPerformedExercise[]>(() =>
    (workout?.exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((we) => {
        const exercise = data.exercises.find((e) => e.id === we.exerciseId);
        return {
          exerciseId: we.exerciseId,
          exerciseName: exercise?.name ?? 'Unknown',
          sets: Array.from({ length: we.targetSets }, (_, i) => ({
            setNumber: i + 1,
            reps: we.targetReps,
            weight: we.targetWeight ?? 0,
            completed: false,
          })),
        };
      })
  );

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-white/60">Workout not found.</Text>
      </View>
    );
  }

  function updateSet(exIndex: number, setIndex: number, patch: Partial<DraftSet>) {
    setExercises((current) =>
      current.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, ...patch } : s)) }
          : ex
      )
    );
  }

  function toggleSetComplete(exIndex: number, setIndex: number) {
    const set = exercises[exIndex]?.sets[setIndex];
    if (!set) return;
    if (!set.completed && set.reps <= 0) {
      showToast('Add reps before marking a set complete', 'error');
      return;
    }
    updateSet(exIndex, setIndex, { completed: !set.completed });
  }

  function addSet(exIndex: number) {
    setExercises((current) =>
      current.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, reps: 0, weight: 0, completed: false }] }
          : ex
      )
    );
  }

  function removeSet(exIndex: number, setIndex: number) {
    setExercises((current) =>
      current.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex).map((s, si) => ({ ...s, setNumber: si + 1 })) }
          : ex
      )
    );
  }

  function addExercise(exercise: Exercise) {
    setExercises((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [{ setNumber: 1, reps: 0, weight: 0, completed: false }],
      },
    ]);
    setPickerVisible(false);
  }

  function removeExercise(exIndex: number) {
    setExercises((current) => current.filter((_, i) => i !== exIndex));
  }

  function handleFinish() {
    const performed: PerformedExercise[] = exercises
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets
          .filter((s) => s.completed)
          .map(({ setNumber, reps, weight }) => ({ setNumber, reps, weight })),
      }))
      .filter((ex) => ex.sets.length > 0);

    if (performed.length === 0) {
      showToast('Mark at least one set complete', 'error');
      return;
    }

    const priorPRs = derivePRs(data.sessions);
    const saved = logSession({
      workoutId: workout!.id,
      workoutName: workout!.name,
      date: new Date().toISOString(),
      startedAt,
      completedAt: new Date().toISOString(),
      exercises: performed,
      notes: notes.trim() || undefined,
    });
    const newPRs = derivePRs([...data.sessions, saved]);
    const touchedIds = new Set(performed.map((p) => p.exerciseId));
    const prHits = newPRs.filter((pr) => {
      if (!touchedIds.has(pr.exerciseId)) return false;
      const prior = priorPRs.find((p) => p.exerciseId === pr.exerciseId);
      return !prior || pr.bestEstimated1RM.estimated1RM > prior.bestEstimated1RM.estimated1RM;
    });

    // The Summary screen now carries the celebratory weight, so no toast
    // here — it would just be redundant with (or covered by) that screen.
    router.replace({
      pathname: '/session/summary/[sessionId]',
      params: { sessionId: saved.id, prExerciseIds: prHits.map((p) => p.exerciseId).join(',') },
    });
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-displayBold text-2xl text-white">{workout.name}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Animated.View
                style={{
                  opacity: pulse,
                  height: 8,
                  width: 8,
                  borderRadius: 4,
                  backgroundColor: '#ef4444',
                }}
              />
              <Text
                className="font-bodySemibold text-base text-white"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatElapsedClock(elapsedSeconds)}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <CloseIcon size={26} />
          </Pressable>
        </View>

        {exercises.map((ex, exIndex) => (
          <Card key={`${ex.exerciseId}-${exIndex}`} className="rounded-[22px]">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-bodyBold text-base text-white">{ex.exerciseName}</Text>
              <Pressable onPress={() => removeExercise(exIndex)} hitSlop={8}>
                <TrashIcon size={18} color="#f87171" />
              </Pressable>
            </View>

            {ex.sets.map((set, setIndex) => (
              <View key={setIndex} className="mb-2 flex-row items-center gap-2">
                <Pressable
                  onPress={() => toggleSetComplete(exIndex, setIndex)}
                  hitSlop={8}
                  className={`h-7 w-7 items-center justify-center rounded-full ${
                    set.completed ? 'bg-primary' : 'border-[1.5px] border-white/30'
                  }`}
                >
                  {set.completed && <CheckIcon size={14} />}
                </Pressable>
                <Text className="w-6 font-body text-sm text-white/50">#{set.setNumber}</Text>
                <View className="flex-1">
                  <Input
                    placeholder="Reps"
                    keyboardType="number-pad"
                    value={set.reps ? String(set.reps) : ''}
                    onChangeText={(v) => updateSet(exIndex, setIndex, { reps: Number(v) || 0 })}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    placeholder="Weight (kg)"
                    keyboardType="number-pad"
                    value={set.weight ? String(set.weight) : ''}
                    onChangeText={(v) => updateSet(exIndex, setIndex, { weight: Number(v) || 0 })}
                  />
                </View>
                <Pressable onPress={() => removeSet(exIndex, setIndex)} hitSlop={8}>
                  <CloseIcon size={18} color="#8A8190" />
                </Pressable>
              </View>
            ))}

            <Button label="Add Set" variant="ghost" onPress={() => addSet(exIndex)} />
          </Card>
        ))}

        <Button label="Add Exercise" variant="ghost" onPress={() => setPickerVisible(true)} />

        <Input label="Notes (optional)" placeholder="How did it feel?" value={notes} onChangeText={setNotes} />
      </ScrollView>

      <View className="p-5">
        <Button label="Finish Workout" onPress={handleFinish} />
      </View>

      <ExercisePicker visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={addExercise} />
    </View>
  );
}
