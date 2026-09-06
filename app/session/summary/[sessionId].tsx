import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGymData } from '../../../lib/GymDataContext';
import { Button } from '../../../components/ui/Button';
import { CheckIcon, TrophyIcon } from '../../../components/icons';
import { formatMinutes } from '../../../lib/dateUtils';
import { derivePRs, sessionDurationMinutes, totalVolume } from '../../../lib/pr';

export default function SessionSummaryScreen() {
  const { sessionId, prExerciseIds } = useLocalSearchParams<{ sessionId: string; prExerciseIds?: string }>();
  const { data } = useGymData();

  const session = data.sessions.find((s) => s.id === sessionId);

  const prHitIds = useMemo(
    () => (prExerciseIds ? prExerciseIds.split(',').filter(Boolean) : []),
    [prExerciseIds]
  );
  const prHits = useMemo(
    () => derivePRs(data.sessions).filter((pr) => prHitIds.includes(pr.exerciseId)),
    [data.sessions, prHitIds]
  );

  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start();
  }, [scale]);

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-white/60">Session not found.</Text>
        <View className="mt-4">
          <Button label="Done" onPress={() => router.replace('/')} />
        </View>
      </View>
    );
  }

  const durationMinutes = sessionDurationMinutes(session) ?? 0;
  const volume = totalVolume(session);
  const setsCount = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const exercisesCount = session.exercises.length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20, flexGrow: 1 }}>
        <View className="mt-6 items-center">
          <Animated.View
            style={{
              transform: [{ scale }],
              height: 80,
              width: 80,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 40,
              backgroundColor: '#9618D1',
            }}
          >
            <CheckIcon size={40} />
          </Animated.View>
          <Text className="mt-5 font-displayBlack text-3xl text-white">Workout Complete!</Text>
          <Text className="mt-1 font-bodyMedium text-base text-white/60">{session.workoutName}</Text>
        </View>

        <View className="items-center rounded-[28px] bg-surface p-6">
          <Text className="font-bodyMedium text-sm text-white/60">Time trained</Text>
          <Text className="mt-1 font-displayBlack text-white" style={{ fontSize: 44, lineHeight: 48 }}>
            {formatMinutes(durationMinutes)}
          </Text>

          <View className="mt-5 w-full flex-row justify-between border-t border-white/10 pt-5">
            <View className="items-center">
              <Text className="font-displayBold text-lg text-white">{Math.round(volume).toLocaleString()}</Text>
              <Text className="mt-0.5 font-body text-xs text-white/50">Volume (kg)</Text>
            </View>
            <View className="items-center">
              <Text className="font-displayBold text-lg text-white">{setsCount}</Text>
              <Text className="mt-0.5 font-body text-xs text-white/50">Sets</Text>
            </View>
            <View className="items-center">
              <Text className="font-displayBold text-lg text-white">{exercisesCount}</Text>
              <Text className="mt-0.5 font-body text-xs text-white/50">Exercises</Text>
            </View>
          </View>
        </View>

        {prHits.length > 0 && (
          <View className="gap-3">
            {prHits.map((pr) => (
              <View
                key={pr.exerciseId}
                className="flex-row items-center gap-3 rounded-[22px] border-[1.5px] border-amber bg-amber/10 p-4"
              >
                <TrophyIcon size={28} />
                <View className="flex-1">
                  <Text className="font-bodyBold text-base text-amber">New PR — {pr.exerciseName}</Text>
                  <Text className="mt-0.5 font-body text-sm text-white/70">
                    {pr.bestEstimated1RM.weight}kg × {pr.bestEstimated1RM.reps}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="mt-auto pt-4">
          <Button label="Done" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </View>
  );
}
