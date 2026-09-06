import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGymData } from '../../../lib/GymDataContext';
import { useToast } from '../../../lib/ToastContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EditIcon, PlayIcon, PlusIcon, TrashIcon } from '../../../components/icons';
import { lastPerformedDate, formatDate } from '../../../lib/dateUtils';
import type { Workout } from '../../../lib/types';

export default function WorkoutsScreen() {
  const { data, deleteWorkout } = useGymData();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Workout | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  function requestDelete(workout: Workout) {
    setPendingDelete(workout);
    setConfirmVisible(true);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteWorkout(pendingDelete.id);
    showToast('Workout deleted', 'success');
    // Only hide the dialog here — leave `pendingDelete` populated so the
    // message keeps showing the real name while the Sheet's close
    // animation plays (Modal `visible={false}` doesn't unmount instantly).
    // It gets overwritten the next time a delete is requested.
    setConfirmVisible(false);
  }

  return (
    <View className="flex-1 bg-background p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-displayBold text-2xl text-white">Workouts</Text>
        <Pressable
          onPress={() => router.push('/workouts/create')}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary active:opacity-80"
        >
          <PlusIcon size={20} />
        </Pressable>
      </View>

      {data.workouts.length === 0 ? (
        <EmptyState
          title="No workouts yet"
          description="Create your first workout to get started."
          ctaLabel="Create your first workout"
          onPressCta={() => router.push('/workouts/create')}
        />
      ) : (
        <FlatList
          data={data.workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => {
            const lastDate = lastPerformedDate(item.id, data.sessions);
            return (
              <Card className="rounded-[22px]">
                <View className="flex-row items-start justify-between">
                  <Pressable className="flex-1" onPress={() => router.push(`/workouts/${item.id}/edit`)}>
                    <Text className="font-displayBold text-lg text-white">{item.name}</Text>
                    <Text className="mt-1 font-body text-sm text-white/50">
                      {item.exercises.length} exercises
                      {lastDate ? ` · Last: ${formatDate(lastDate)}` : ' · Never performed'}
                    </Text>
                  </Pressable>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => router.push(`/workouts/${item.id}/edit`)}
                      hitSlop={8}
                      className="h-8 w-8 items-center justify-center rounded-full bg-surfaceTile active:opacity-70"
                    >
                      <EditIcon size={16} />
                    </Pressable>
                    <Pressable
                      onPress={() => requestDelete(item)}
                      hitSlop={8}
                      className="h-8 w-8 items-center justify-center rounded-full bg-red-600/20 active:opacity-70"
                    >
                      <TrashIcon size={16} color="#f87171" />
                    </Pressable>
                  </View>
                </View>
                <View className="mt-4">
                  <Button
                    label="Start"
                    icon={<PlayIcon size={18} />}
                    onPress={() => router.push(`/session/${item.id}`)}
                  />
                </View>
              </Card>
            );
          }}
        />
      )}

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete workout?"
        message={`"${pendingDelete?.name}" will be removed. Past sessions logged for it stay in your history.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}
