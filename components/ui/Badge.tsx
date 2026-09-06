import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  tone?: 'primary' | 'neutral' | 'celebration';
}

const TONE_CLASSES: Record<string, string> = {
  primary: 'bg-primary/20 text-primary',
  neutral: 'bg-white/10 text-white/70',
  celebration: 'bg-primary text-white',
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const [bg] = TONE_CLASSES[tone].split(' ');
  const textClass = TONE_CLASSES[tone].split(' ').slice(1).join(' ');
  return (
    <View className={`self-start rounded-full px-3 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${textClass}`}>{label}</Text>
    </View>
  );
}
