import { ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeaderProps = {
  eyebrow?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  title: string;
};

export function Header({ eyebrow, onBack, right, title }: HeaderProps) {
  return (
    <SafeAreaView edges={['top']} className="bg-background">
      <View className="flex-row items-center justify-between px-5 pb-4 pt-2">
        <View className="flex-row flex-1 items-center gap-3">
          {onBack ? (
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
              onPress={onBack}
            >
              <ChevronLeft color="#0F172A" size={22} />
            </Pressable>
          ) : null}
          <View className="flex-1">
            {eyebrow ? <Text className="text-xs font-bold uppercase tracking-[1px] text-brand-600">{eyebrow}</Text> : null}
            <Text className="text-2xl font-black text-ink-900">{title}</Text>
          </View>
        </View>
        {right}
      </View>
    </SafeAreaView>
  );
}
