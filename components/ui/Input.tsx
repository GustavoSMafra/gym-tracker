import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...rest }: InputProps) {
  return (
    <View className="w-full">
      {label && <Text className="mb-1 text-sm font-medium text-white/70">{label}</Text>}
      <TextInput
        placeholderTextColor="#8A8190"
        className={`rounded-xl bg-surface px-4 py-3 text-base text-white ${
          error ? 'border border-red-500' : ''
        } ${className ?? ''}`}
        {...rest}
      />
      {error && <Text className="mt-1 text-sm text-red-400">{error}</Text>}
    </View>
  );
}
