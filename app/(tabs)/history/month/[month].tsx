import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGymData } from '../../../../lib/GymDataContext';
import { Card } from '../../../../components/ui/Card';
import { formatDate, monthKey, monthLabel } from '../../../../lib/dateUtils';
import { sessionDurationMinutes, totalVolume } from '../../../../lib/pr';

export default function MonthSessionsScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const { data } = useGymData();

  const sessions = useMemo(
    () =>
      data.sessions
        .filter((s) => monthKey(new Date(s.date)) === month)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.sessions, month]
  );

  return (
    <View className="flex-1 bg-background p-5">
      <Text className="mb-4 font-displayBold text-2xl text-white">{month ? monthLabel(month) : 'Sessions'}</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const durationMinutes = sessionDurationMinutes(item);
          return (
            <Card className="rounded-[22px]" onPress={() => router.push(`/history/session/${item.id}`)}>
              <View className="flex-row items-center justify-between">
                <Text className="font-bodyBold text-base text-white">{item.workoutName}</Text>
                <Text className="font-body text-xs text-white/50">{formatDate(item.date)}</Text>
              </View>
              <Text className="mt-1 font-body text-sm text-white/50">
                {item.exercises.length} exercises · {Math.round(totalVolume(item)).toLocaleString()} kg volume
                {durationMinutes !== undefined ? ` · ${durationMinutes} min` : ''}
              </Text>
            </Card>
          );
        }}
      />
    </View>
  );
}
