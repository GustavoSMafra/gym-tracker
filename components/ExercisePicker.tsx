import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Sheet } from './ui/Sheet';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useGymData } from '../lib/GymDataContext';
import { useToast } from '../lib/ToastContext';
import type { Exercise } from '../lib/types';

interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePicker({ visible, onClose, onSelect }: ExercisePickerProps) {
  const { data, addCustomExercise } = useGymData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('');

  const filtered = data.exercises
    .filter((e) => e.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  function handleAddCustom() {
    if (!customName.trim()) {
      showToast('Exercise name is required', 'error');
      return;
    }
    const exercise = addCustomExercise(customName, customMuscleGroup);
    showToast('Exercise added', 'success');
    setCustomName('');
    setCustomMuscleGroup('');
    onSelect(exercise);
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-3 text-lg font-bold text-white">Add Exercise</Text>
      <Input placeholder="Search exercises" value={search} onChangeText={setSearch} className="mb-3" />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 240 }}
        ListEmptyComponent={<Text className="py-2 text-sm text-white/50">No matches.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="flex-row items-center justify-between border-b border-white/10 py-3 active:opacity-70"
          >
            <Text className="text-base text-white">{item.name}</Text>
            <Text className="text-xs text-white/50">{item.muscleGroup}</Text>
          </Pressable>
        )}
      />

      <View className="mt-4 gap-2 border-t border-white/10 pt-4">
        <Text className="text-sm font-medium text-white/70">Or add a custom exercise</Text>
        <Input placeholder="Exercise name" value={customName} onChangeText={setCustomName} />
        <Input placeholder="Muscle group (optional)" value={customMuscleGroup} onChangeText={setCustomMuscleGroup} />
        <Button label="Add Custom Exercise" variant="secondary" onPress={handleAddCustom} />
      </View>
    </Sheet>
  );
}
