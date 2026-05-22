import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';

import { Button } from './Button';

type ModalProps = {
  children: ReactNode;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  visible: boolean;
};

export function Modal({ children, confirmLabel = 'Entendi', onClose, onConfirm, title, visible }: ModalProps) {
  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-ink-900/60 px-5">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="text-xl font-black text-ink-900">{title}</Text>
          <View className="mt-3">{children}</View>
          <Button className="mt-5" title={confirmLabel} onPress={onConfirm || onClose} />
        </View>
      </View>
    </RNModal>
  );
}
