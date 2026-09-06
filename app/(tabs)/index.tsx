import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGymData } from '../../lib/GymDataContext';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { CalendarIcon, ClockIcon, DumbbellIcon, FlameIcon, PlayIcon, TrophyIcon } from '../../components/icons';
import {
  currentStreakWeeks,
  formatMinutes,
  sessionsThisMonth,
  sessionsThisWeek,
  suggestWorkoutId,
} from '../../lib/dateUtils';
import { derivePRs, sessionDurationMinutes, totalVolume } from '../../lib/pr';

function StatTile({
  icon,
  value,
  label,
  tone = 'default',
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone?: 'default' | 'celebration';
}) {
  return (
    <View className="w-[48%] rounded-2xl bg-surfaceTile p-4">
      <View
        className={`h-8 w-8 items-center justify-center rounded-full ${
          tone === 'celebration' ? 'bg-amber/20' : 'bg-primary/20'
        }`}
      >
        {icon}
      </View>
      <Text className="mt-3 font-displayBold text-xl text-white">{value}</Text>
      <Text className="mt-0.5 font-body text-xs text-white/50">{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { data, loading } = useGymData();
  const { workouts, sessions, settings } = data;

  const weekSessions = useMemo(() => sessionsThisWeek(sessions), [sessions]);
  const monthSessions = useMemo(() => sessionsThisMonth(sessions), [sessions]);
  const streak = useMemo(() => currentStreakWeeks(sessions), [sessions]);
  const suggestedId = useMemo(
    () => suggestWorkoutId(workouts.map((w) => w.id), sessions),
    [workouts, sessions]
  );
  const suggested = workouts.find((w) => w.id === suggestedId);

  const monthVolume = useMemo(
    () => monthSessions.reduce((sum, s) => sum + totalVolume(s), 0),
    [monthSessions]
  );
  const weekMinutes = useMemo(
    () => weekSessions.reduce((sum, s) => sum + (sessionDurationMinutes(s) ?? 0), 0),
    [weekSessions]
  );
  const monthMinutes = useMemo(
    () => monthSessions.reduce((sum, s) => sum + (sessionDurationMinutes(s) ?? 0), 0),
    [monthSessions]
  );
  const monthPRs = useMemo(() => {
    const now = new Date();
    return derivePRs(sessions).filter((p) => {
      const d = new Date(p.bestEstimated1RM.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [sessions]);

  if (loading) return null;

  if (workouts.length === 0) {
    return (
      <View className="flex-1 justify-center bg-background p-5">
        <EmptyState
          title="No workouts yet"
          description="Create your first workout to start tracking progress."
          ctaLabel="Create your first workout"
          onPressCta={() => router.push('/workouts/create')}
        />
      </View>
    );
  }

  const weekGoal = settings.weeklyGoal;
  const weekProgress = weekGoal > 0 ? weekSessions.length / weekGoal : 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text className="font-displayBold text-2xl text-white">Dashboard</Text>
        <Text className="mt-1 font-body text-sm text-white/50">Let's keep the streak going</Text>
      </View>

      <View className="flex-row items-center justify-between rounded-[28px] bg-surface p-5">
        <View>
          <Text className="font-bodyMedium text-sm text-white/60">This week</Text>
          <View className="mt-1 flex-row items-baseline">
            <Text className="font-displayBlack text-white" style={{ fontSize: 44, lineHeight: 48 }}>
              {weekSessions.length}
            </Text>
            <Text className="ml-1 font-bodySemibold text-lg text-white/50">/ {weekGoal} sessions</Text>
          </View>
          <View className="mt-3 flex-row items-center gap-2">
            <FlameIcon size={20} />
            <Text className="font-bodyBold text-base text-white">
              {streak} week{streak === 1 ? '' : 's'}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center gap-1.5">
            <ClockIcon size={14} color="rgba(255,255,255,0.5)" />
            <Text className="font-body text-sm text-white/60">{formatMinutes(weekMinutes)} trained</Text>
          </View>
        </View>
        <ProgressRing progress={weekProgress} label={`${Math.round(weekProgress * 100)}%`} />
      </View>

      {suggested && (
        <Card className="rounded-[22px]">
          <Text className="font-bodyMedium text-sm text-white/60">Suggested for today</Text>
          <Text className="mt-1 font-displayBold text-xl text-white">{suggested.name}</Text>
          <Text className="mt-1 font-body text-sm text-white/50">{suggested.exercises.length} exercises</Text>
          <View className="mt-3">
            <Button
              label="Start Workout"
              icon={<PlayIcon size={18} />}
              onPress={() => router.push(`/session/${suggested.id}`)}
            />
          </View>
        </Card>
      )}

      <Card className="rounded-[22px]">
        <Text className="mb-3 font-bodyMedium text-sm text-white/60">This month</Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          <StatTile icon={<CalendarIcon size={16} />} value={String(monthSessions.length)} label="Sessions" />
          <StatTile
            icon={<DumbbellIcon size={16} />}
            value={Math.round(monthVolume).toLocaleString()}
            label="Volume (kg)"
          />
          <StatTile icon={<ClockIcon size={16} />} value={formatMinutes(monthMinutes)} label="Trained" />
          <StatTile
            icon={<TrophyIcon size={16} />}
            value={String(monthPRs)}
            label="New PRs"
            tone="celebration"
          />
        </View>
      </Card>
    </ScrollView>
  );
}
