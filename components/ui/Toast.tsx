import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '../../lib/ToastContext';

const VARIANT_CLASSES: Record<string, string> = {
  success: 'bg-primary',
  error: 'bg-red-600',
  info: 'bg-secondary',
};

export function ToastHost() {
  const { toast } = useToast();
  if (!toast) return null;

  return (
    <SafeAreaView style={{ pointerEvents: 'none' }} className="absolute bottom-0 left-0 right-0 items-center px-4 pb-4">
      <Text className={`rounded-xl px-4 py-3 text-center text-sm font-medium text-white ${VARIANT_CLASSES[toast.variant]}`}>
        {toast.message}
      </Text>
    </SafeAreaView>
  );
}
