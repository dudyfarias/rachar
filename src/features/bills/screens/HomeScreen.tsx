import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LogOut, Plus, ReceiptText, UsersRound } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { useAuthStore } from '../../../stores/authStore';
import { useBillStore } from '../../../stores/billStore';
import type { RootStackParamList } from '../../../types/navigation';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const draft = useBillStore((state) => state.draft);
  const resetDraft = useBillStore((state) => state.resetDraft);
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const subtotal = draft.items.reduce((sum, item) => sum + item.priceInCents, 0);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Nao foi possivel sair', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  function startNewBill() {
    resetDraft();
    navigation.navigate('NewBill');
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        eyebrow="Conta inteligente"
        right={
          <Pressable
            accessibilityLabel="Sair"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={handleSignOut}
          >
            <LogOut color="#0F172A" size={19} />
          </Pressable>
        }
        title="Rachaê"
      />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Card className="bg-ink-900">
          <Text className="text-sm font-bold text-white/70">Ola, {user?.user_metadata?.full_name || user?.email || 'time Rachaê'}</Text>
          <Text className="mt-3 text-3xl font-black text-white">Divida a proxima conta em minutos.</Text>
          <Text className="mt-3 text-base leading-6 text-white/70">
            Sprint 1 cobre o fluxo manual. OCR, Pix e IA entram como extensoes planejadas.
          </Text>
          <Button
            className="mt-6 bg-money-500"
            leftIcon={<Plus color="#0F172A" size={20} />}
            textClassName="text-ink-900"
            title="Nova conta"
            onPress={startNewBill}
          />
        </Card>

        <View className="mt-5 flex-row gap-3">
          <Card className="flex-1">
            <ReceiptText color="#00A676" size={24} />
            <Text className="mt-3 text-2xl font-black text-ink-900">{draft.items.length}</Text>
            <Text className="text-sm text-ink-500">itens no rascunho</Text>
          </Card>
          <Card className="flex-1">
            <UsersRound color="#00A676" size={24} />
            <Text className="mt-3 text-2xl font-black text-ink-900">{draft.people.length}</Text>
            <Text className="text-sm text-ink-500">pessoas</Text>
          </Card>
        </View>

        <Card className="mt-5">
          <Text className="text-sm font-bold uppercase tracking-[1px] text-brand-600">Resumo rapido</Text>
          <Text className="mt-2 text-3xl font-black text-ink-900">{formatCurrency(subtotal)}</Text>
          <Text className="mt-1 text-sm text-ink-500">Subtotal salvo localmente no rascunho atual.</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
