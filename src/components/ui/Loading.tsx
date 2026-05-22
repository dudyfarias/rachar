import { ActivityIndicator, Text, View } from 'react-native';

type LoadingProps = {
  label?: string;
};

export function Loading({ label = 'Carregando...' }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="rounded-2xl bg-white p-6 shadow-sm">
        <ActivityIndicator color="#00A676" size="large" />
      </View>
      <Text className="mt-4 text-center text-sm font-semibold text-ink-500">{label}</Text>
    </View>
  );
}
