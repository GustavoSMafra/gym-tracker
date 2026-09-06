import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

// Tactile "pressed" look: a solid bottom edge in the darker shade that
// flattens and shifts the button down on actual press, rather than a soft
// opacity fade. Ghost stays flat/outlined — intentionally lower emphasis.
const TACTILE_COLORS: Record<'primary' | 'secondary' | 'destructive', { base: string; dark: string }> = {
  primary: { base: '#9618D1', dark: '#70129D' },
  secondary: { base: '#5A376B', dark: '#3F2749' },
  destructive: { base: '#DC2626', dark: '#8C1A1A' },
};

const EDGE_HEIGHT = 4;

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon }: ButtonProps) {
  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/20 bg-transparent px-5 py-3.5 active:opacity-70 ${
          disabled ? 'opacity-40' : ''
        }`}
      >
        {loading && <ActivityIndicator color="white" className="mr-2" />}
        {icon}
        <Text className="font-bodyBold text-base text-white">{label}</Text>
      </Pressable>
    );
  }

  const colors = TACTILE_COLORS[variant];

  return (
    <Pressable onPress={onPress} disabled={disabled || loading}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.base,
            borderBottomColor: colors.dark,
            borderBottomWidth: pressed ? 0 : EDGE_HEIGHT,
            borderStyle: 'solid',
            marginTop: pressed ? EDGE_HEIGHT : 0,
            opacity: disabled ? 0.4 : 1,
          }}
          className="flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5"
        >
          {loading && <ActivityIndicator color="white" className="mr-2" />}
          {icon}
          <Text className="font-bodyBold text-base text-white">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
