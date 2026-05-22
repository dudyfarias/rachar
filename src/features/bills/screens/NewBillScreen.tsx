import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HelpCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, Button, Card, Header, Input } from '../../../components/ui';
import { formatCurrency, maskCurrencyInput, parseCurrencyToCents } from '../../../lib/formatCurrency';
import { useBillStore } from '../../../stores/billStore';
import type { RootStackParamList } from '../../../types/navigation';

type NewBillNavigation = NativeStackNavigationProp<RootStackParamList, 'NewBill'>;

function currencyInitialValue(valueInCents: number) {
  return valueInCents > 0 ? formatCurrency(valueInCents) : '';
}

export function NewBillScreen() {
  const navigation = useNavigation<NewBillNavigation>();
  const draft = useBillStore((state) => state.draft);
  const updateBillMeta = useBillStore((state) => state.updateBillMeta);
  const [title, setTitle] = useState(draft.title);
  const [place, setPlace] = useState(draft.place);
  const [serviceFee, setServiceFee] = useState(currencyInitialValue(draft.serviceFeeInCents));
  const [discount, setDiscount] = useState(currencyInitialValue(draft.discountInCents));
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  function handleContinue() {
    if (!title.trim()) {
      Alert.alert('Nome da conta', 'Dê um nome para identificar este racha.');
      return;
    }

    updateBillMeta({
      discountInCents: parseCurrencyToCents(discount),
      place: place.trim(),
      serviceFeeInCents: parseCurrencyToCents(serviceFee),
      title: title.trim(),
    });
    navigation.navigate('AddPeople');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <Header
        eyebrow="Passo 1 de 4"
        onBack={navigation.goBack}
        right={
          <Pressable
            accessibilityLabel="Ver regras"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={() => setIsSheetOpen(true)}
          >
            <HelpCircle color="#0F172A" size={19} />
          </Pressable>
        }
        title="Nova conta"
      />
      <ScrollView contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card>
          <Text className="text-lg font-black text-ink-900">Dados basicos</Text>
          <Text className="mt-1 text-sm leading-5 text-ink-500">
            Comece pelo nome da conta. Taxa e desconto entram proporcionalmente no calculo final.
          </Text>
          <View className="mt-5 gap-4">
            <Input label="Nome da conta" onChangeText={setTitle} placeholder="Almoco de domingo" value={title} />
            <Input label="Local" onChangeText={setPlace} placeholder="Restaurante, bar ou mercado" value={place} />
          </View>
        </Card>

        <Card className="mt-4">
          <Text className="text-lg font-black text-ink-900">Ajustes financeiros</Text>
          <View className="mt-5 gap-4">
            <Input
              keyboardType="number-pad"
              label="Taxa de servico"
              onChangeText={(value) => setServiceFee(maskCurrencyInput(value))}
              placeholder="R$ 0,00"
              value={serviceFee}
            />
            <Input
              keyboardType="number-pad"
              label="Desconto"
              onChangeText={(value) => setDiscount(maskCurrencyInput(value))}
              placeholder="R$ 0,00"
              value={discount}
            />
          </View>
        </Card>
      </ScrollView>

      <View className="border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        <Button size="lg" title="Adicionar pessoas" onPress={handleContinue} />
      </View>

      <BottomSheet title="Como o Sprint 1 calcula?" visible={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <View className="gap-3">
          <Text className="text-base leading-6 text-ink-600">
            Cada item e dividido apenas entre as pessoas selecionadas naquele item.
          </Text>
          <Text className="text-base leading-6 text-ink-600">
            Taxa e desconto sao distribuidos proporcionalmente ao subtotal de cada pessoa.
          </Text>
          <Text className="text-base leading-6 text-ink-600">
            O arredondamento acontece em centavos com distribuicao deterministica do resto.
          </Text>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
