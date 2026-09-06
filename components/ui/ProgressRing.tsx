import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressRing({ progress, size = 96, strokeWidth = 10, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {/* Rotate the whole SVG (rather than react-native-svg's Circle
          rotation/origin props) so the progress arc starts at 12 o'clock —
          the per-Circle props render as a raw kebab-case transform-origin
          DOM attribute on web, which React flags as invalid. */}
      <View style={{ transform: [{ rotate: '-90deg' }] }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#5A376B"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#9618D1"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      {label && (
        <View className="absolute items-center justify-center">
          <Text className="text-base font-bold text-white">{label}</Text>
        </View>
      )}
    </View>
  );
}
