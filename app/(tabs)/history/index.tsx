import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGymData } from '../../../lib/GymDataContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { CalendarIcon } from '../../../components/icons';
import { formatMinutes, sessionsGroupedByMonth } from '../../../lib/dateUtils';
import { derivePRs, sessionDurationMinutes, totalVolume } from '../../../lib/pr';

type SegmentKey = 'sessions' | 'prs';

export default function HistoryScreen() {
  const { data } = useGymData();
  const [segment, setSegment] = useState<SegmentKey>('sessions');

  const monthGroups = useMemo(() => sessionsGroupedByMonth(data.sessions), [data.sessions]);
  const prs = useMemo(() => derivePRs(data.sessions), [data.sessions]);

  return (
    <View className="flex-1 bg-background p-5">
      <Text className="mb-4 font-displayBold text-2xl text-white">History</Text>

      <View className="mb-4 flex-row rounded-xl bg-surface p-1">
        {(['sessions', 'prs'] as SegmentKey[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => setSegment(key)}
            className={`flex-1 items-center rounded-lg py-2 ${segment === key ? 'bg-primary' : ''}`}
          >
            <Text className={`font-bodySemibold text-sm ${segment === key ? 'text-white' : 'text-white/60'}`}>
              {key === 'sessions' ? 'Sessions' : 'PRs'}
            </Text>
          </Pressable>
        ))}
      </View>

      {segment === 'sessions' ? (
        monthGroups.length === 0 ? (
          <EmptyState
            title="No sessions logged yet"
            description="Start a workout to log your first session."
            ctaLabel="Log your first workout"
            onPressCta={() => router.push('/workouts')}
          />
        ) : (
          <FlatList
            data={monthGroups}
            keyExtractor={(item) => item.monthKey}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => {
              const volume = item.sessions.reduce((sum, s) => sum + totalVolume(s), 0);
              const minutes = item.sessions.reduce((sum, s) => sum + (sessionDurationMinutes(s) ?? 0), 0);
              return (
                <Card className="flex-row items-center gap-4 rounded-[22px]" onPress={() => router.push(`/history/month/${item.monthKey}`)}>
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surfaceTile">
                    <CalendarIcon size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-displayBold text-base text-white">{item.label}</Text>
                    <Text className="mt-1 font-body text-sm text-white/50">
                      {item.sessions.length} session{item.sessions.length === 1 ? '' : 's'} ·{' '}
                      {Math.round(volume).toLocaleString()} kg · {formatMinutes(minutes)}
                    </Text>
                  </View>
                </Card>
              );
            }}
          />
        )
      ) : prs.length === 0 ? (
        <EmptyState
          title="No PRs yet"
          description="Log a session to start tracking personal records."
          ctaLabel="Log your first workout"
          onPressCta={() => router.push('/workouts')}
        />
      ) : (
        <FlatList
          data={prs}
          keyExtractor={(item) => item.exerciseId}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Card className="rounded-[22px]" onPress={() => router.push(`/history/pr/${item.exerciseId}`)}>
              <Text className="font-bodyBold text-base text-white">{item.exerciseName}</Text>
              <View className="mt-2 flex-row gap-2">
                <Badge label={`Best: ${item.bestWeight.weight}kg × ${item.bestWeight.reps}`} tone="primary" />
                <Badge label={`Est. 1RM: ${Math.round(item.bestEstimated1RM.estimated1RM)}kg`} tone="neutral" />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
