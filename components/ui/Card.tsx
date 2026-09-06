import React from 'react';
import { Pressable, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
}

export function Card({ onPress, children, className, ...rest }: CardProps) {
  const content = (
    <View className={`rounded-2xl bg-surface p-4 ${className ?? ''}`} {...rest}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      {content}
    </Pressable>
  );
}
