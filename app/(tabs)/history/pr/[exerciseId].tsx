import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGymData } from '../../../../lib/GymDataContext';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { formatDate } from '../../../../lib/dateUtils';
import { prHistoryForExercise } from '../../../../lib/pr';

export default function ExercisePRScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { data } = useGymData();
  const exercise = data.exercises.find((e) => e.id === exerciseId);
  const history = useMemo(
    () => (exerciseId ? prHistoryForExercise(data.sessions, exerciseId).reverse() : []),
    [data.sessions, exerciseId]
  );

  return (
    <View className="flex-1 bg-background p-5">
      <Text className="mb-4 text-2xl font-bold text-white">{exercise?.name ?? 'Exercise'}</Text>
      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <Card className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-white">
                {item.weight}kg × {item.reps}
              </Text>
              <Text className="text-xs text-white/50">{formatDate(item.date)}</Text>
            </View>
            <Badge label={`Est. 1RM: ${Math.round(item.estimated1RM)}kg`} tone="primary" />
          </Card>
        )}
      />
    </View>
  );
}
