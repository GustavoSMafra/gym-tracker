import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel: string;
  onPressCta: () => void;
}

export function EmptyState({ title, description, ctaLabel, onPressCta }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-3 rounded-2xl bg-surface p-8">
      <Text className="text-center text-lg font-bold text-white">{title}</Text>
      {description && <Text className="text-center text-sm text-white/60">{description}</Text>}
      <View className="mt-2 w-full">
        <Button label={ctaLabel} onPress={onPressCta} />
      </View>
    </View>
  );
}
