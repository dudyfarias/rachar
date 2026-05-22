import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { calculateSplits } from '../../../services/billing/calculateSplits';
import { useBillStore } from '../../../stores/billStore';
import type { RootStackParamList } from '../../../types/navigation';

type ResultNavigation = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export function ResultScreen() {
  const navigation = useNavigation<ResultNavigation>();
  const draft = useBillStore((state) => state.draft);
  const resetDraft = useBillStore((state) => state.resetDraft);

  const result = useMemo(() => {
    try {
      return { data: calculateSplits(draft), error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Nao foi possivel calcular.' };
    }
  }, [draft]);

  function finishFlow() {
    resetDraft();
    navigation.navigate('Home');
  }

  function handleShare() {
    if (!result.data) {
      Alert.alert('Resultado indisponivel', result.error || 'Revise os dados da conta.');
      return;
    }

    Alert.alert('Compartilhamento', 'Integracao com WhatsApp/Pix planejada para os proximos sprints.');
  }

  if (!result.data) {
    return (
      <View className="flex-1 bg-background">
        <Header eyebrow="Passo 4 de 4" onBack={navigation.goBack} title="Resultado" />
        <View className="flex-1 justify-center px-5">
          <Card>
            <Text className="text-xl font-black text-ink-900">Revise o racha</Text>
            <Text className="mt-2 text-base leading-6 text-ink-500">{result.error}</Text>
            <Button className="mt-5" title="Voltar para itens" onPress={navigation.goBack} />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        eyebrow="Passo 4 de 4"
        onBack={navigation.goBack}
        right={
          <Pressable
            accessibilityLabel="Compartilhar"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={handleShare}
          >
            <Share2 color="#0F172A" size={19} />
          </Pressable>
        }
        title="Resultado"
      />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Card className="bg-brand-500">
          <Text className="text-sm font-bold uppercase tracking-[1px] text-white/70">{draft.place || 'Conta manual'}</Text>
          <Text className="mt-2 text-3xl font-black text-white">{draft.title}</Text>
          <Text className="mt-5 text-sm font-bold text-white/70">Total do racha</Text>
          <Text className="text-5xl font-black text-white">{formatCurrency(result.data.totalInCents)}</Text>
        </Card>

        <Card className="mt-5">
          <View className="flex-row justify-between">
            <Text className="text-sm text-ink-500">Subtotal</Text>
            <Text className="text-sm font-bold text-ink-900">{formatCurrency(result.data.subtotalInCents)}</Text>
          </View>
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-ink-500">Taxa</Text>
            <Text className="text-sm font-bold text-ink-900">{formatCurrency(result.data.serviceFeeInCents)}</Text>
          </View>
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-ink-500">Desconto</Text>
            <Text className="text-sm font-bold text-brand-700">- {formatCurrency(result.data.discountInCents)}</Text>
          </View>
        </Card>

        <View className="mt-5 gap-3">
          {result.data.people.map((person) => (
            <Card key={person.personId}>
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-lg font-black text-ink-900">{person.name}</Text>
                  <Text className="mt-1 text-sm text-ink-500">
                    Itens {formatCurrency(person.itemSubtotalInCents)} + taxa {formatCurrency(person.serviceFeeInCents)} - desconto{' '}
                    {formatCurrency(person.discountInCents)}
                  </Text>
                </View>
                <Text className="text-xl font-black text-brand-700">{formatCurrency(person.totalInCents)}</Text>
              </View>

              <View className="mt-4 gap-2 border-t border-ink-100 pt-4">
                {person.items.map((item) => (
                  <View key={`${person.personId}-${item.itemId}`} className="flex-row justify-between">
                    <Text className="text-sm text-ink-500">{item.itemName}</Text>
                    <Text className="text-sm font-bold text-ink-700">{formatCurrency(item.amountInCents)}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        <Button size="lg" title="Finalizar racha" onPress={finishFlow} />
      </View>
    </View>
  );
}
