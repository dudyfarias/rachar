import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BottomSheetProps = {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  title?: string;
  visible: boolean;
};

export function BottomSheet({ children, footer, onClose, title, visible }: BottomSheetProps) {
  return (
    <RNModal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-ink-900/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-white px-5 pb-2 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1.5 w-12 rounded-full bg-ink-100" />
          </View>
          {title ? <Text className="mb-4 text-xl font-black text-ink-900">{title}</Text> : null}
          {children}
          {footer ? <View className="mt-5">{footer}</View> : null}
        </SafeAreaView>
      </View>
    </RNModal>
  );
}
