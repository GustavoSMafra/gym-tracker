import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGymData } from '../../../../lib/GymDataContext';
import { Card } from '../../../../components/ui/Card';
import { formatDate } from '../../../../lib/dateUtils';
import { totalVolume } from '../../../../lib/pr';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useGymData();
  const session = data.sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-white/60">Session not found.</Text>
      </View>
    );
  }

  const durationMinutes = session.completedAt
    ? Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
    : undefined;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text className="text-2xl font-bold text-white">{session.workoutName}</Text>
      <Text className="text-sm text-white/50">
        {formatDate(session.date)}
        {durationMinutes !== undefined ? ` · ${durationMinutes} min` : ''} ·{' '}
        {Math.round(totalVolume(session)).toLocaleString()} kg volume
      </Text>

      {session.exercises.map((exercise, i) => (
        <Card key={`${exercise.exerciseId}-${i}`}>
          <Text className="mb-2 text-base font-semibold text-white">{exercise.exerciseName}</Text>
          {exercise.sets.map((set) => (
            <Text key={set.setNumber} className="text-sm text-white/70">
              Set {set.setNumber}: {set.reps} reps × {set.weight} kg
            </Text>
          ))}
        </Card>
      ))}

      {session.notes && (
        <Card>
          <Text className="text-sm font-medium text-white/60">Notes</Text>
          <Text className="mt-1 text-sm text-white/80">{session.notes}</Text>
        </Card>
      )}
    </ScrollView>
  );
}
