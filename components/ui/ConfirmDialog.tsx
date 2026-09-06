import React from 'react';
import { Text, View } from 'react-native';
import { Sheet } from './Sheet';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Sheet visible={visible} onClose={onCancel}>
      <Text className="mb-2 text-lg font-bold text-white">{title}</Text>
      <Text className="mb-5 text-base text-white/70">{message}</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button label="Cancel" variant="ghost" onPress={onCancel} />
        </View>
        <View className="flex-1">
          <Button label={confirmLabel} variant="destructive" onPress={onConfirm} />
        </View>
      </View>
    </Sheet>
  );
}
