import React from 'react';
import { Modal, Pressable, View } from 'react-native';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose}>
        <View className="mt-auto">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-3xl bg-surface p-5 pb-8">{children}</View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
