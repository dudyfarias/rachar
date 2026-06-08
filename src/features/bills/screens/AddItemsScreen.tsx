import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Check, Info, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, Button, Card, FlowStepHeader, Header, Input } from '../../../components/ui';
import { formatCurrency, maskCurrencyInput, parseCurrencyToCents } from '../../../lib/formatCurrency';
import { cn } from '../../../lib/cn';
import { useBillStore } from '../../../stores/billStore';
import type { RootStackParamList } from '../../../types/navigation';

type AddItemsNavigation = NativeStackNavigationProp<RootStackParamList, 'AddItems'>;

export function AddItemsScreen() {
  const navigation = useNavigation<AddItemsNavigation>();
  const { items, people } = useBillStore((state) => state.draft);
  const addItem = useBillStore((state) => state.addItem);
  const removeItem = useBillStore((state) => state.removeItem);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(people.map((person) => person.id));
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  function togglePerson(personId: string) {
    setSelectedPersonIds((current) =>
      current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId],
    );
  }

  function handleAddItem() {
    const priceInCents = parseCurrencyToCents(price);

    if (!itemName.trim()) {
      Alert.alert('Nome do item', 'Informe o nome do item.');
      return;
    }

    if (priceInCents <= 0) {
      Alert.alert('Valor do item', 'Informe um valor maior que zero.');
      return;
    }

    if (selectedPersonIds.length === 0) {
      Alert.alert('Participantes', 'Selecione quem consumiu este item.');
      return;
    }

    addItem({
      name: itemName.trim(),
      participantIds: selectedPersonIds,
      priceInCents,
    });
    setItemName('');
    setPrice('');
    setSelectedPersonIds(people.map((person) => person.id));
  }

  function handleContinue() {
    if (items.length === 0) {
      Alert.alert('Adicione itens', 'Inclua pelo menos um item para calcular o racha.');
      return;
    }

    navigation.navigate('Result');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background" testID="screen-add-items">
      <Header
        eyebrow="Passo 3 de 4"
        onBack={navigation.goBack}
        right={
          <Pressable
            accessibilityLabel="Ver detalhes"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={() => setIsSheetOpen(true)}
            testID="add-items-details-button"
          >
            <Info color="#0F172A" size={19} />
          </Pressable>
        }
        testID="add-items-header"
        title="Adicionar itens"
      />
      <FlowStepHeader currentStep={3} steps={['Conta', 'Pessoas', 'Itens', 'Resultado']} testID="add-items-flow-steps" />
      <ScrollView contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} testID="add-items-scroll">
        <Card>
          <Text className="text-lg font-black text-ink-900">Novo item</Text>
          <View className="mt-5 gap-4">
            <Input label="Item" onChangeText={setItemName} placeholder="Hamburguer, refri, sobremesa..." testID="add-items-name-input" value={itemName} />
            <Input
              keyboardType="number-pad"
              label="Valor"
              onChangeText={(value) => setPrice(maskCurrencyInput(value))}
              placeholder="R$ 0,00"
              testID="add-items-price-input"
              value={price}
            />
          </View>

          <Text className="mt-5 text-sm font-bold text-ink-700">Quem dividiu este item?</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {people.map((person) => {
              const isSelected = selectedPersonIds.includes(person.id);

              return (
                <Pressable
                  key={person.id}
                  accessibilityLabel={`Alternar participante ${person.name}`}
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center gap-2 rounded-full border px-4 py-2',
                    isSelected ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white',
                  )}
                  testID={`add-items-person-toggle-${person.id}`}
                  onPress={() => togglePerson(person.id)}
                >
                  {isSelected ? <Check color="#00A676" size={16} /> : null}
                  <Text className={cn('font-bold', isSelected ? 'text-brand-700' : 'text-ink-600')}>{person.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button className="mt-5" testID="add-items-add-button" title="Adicionar item" onPress={handleAddItem} />
        </Card>

        <View className="mt-5 gap-3">
          {items.length === 0 ? (
            <Card className="items-center py-8">
              <Text className="text-center text-base font-bold text-ink-700">Nenhum item adicionado ainda.</Text>
              <Text className="mt-1 text-center text-sm text-ink-500">Cada item pode ter uma combinacao diferente de pessoas.</Text>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} testID={`add-items-card-${item.id}`}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-black text-ink-900">{item.name}</Text>
                    <Text className="mt-1 text-sm text-ink-500">
                      {item.participantIds.length} pessoa(s) - {formatCurrency(item.priceInCents)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Remover ${item.name}`}
                    accessibilityRole="button"
                    testID={`add-items-remove-${item.id}`}
                    onPress={() => removeItem(item.id)}
                  >
                    <Trash2 color="#EF4444" size={20} />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        <Button size="lg" testID="add-items-continue-button" title="Ver resultado" onPress={handleContinue} />
      </View>

      <BottomSheet title="Itens e participantes" visible={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <Text className="text-base leading-6 text-ink-600">
          Um item de R$ 10,00 dividido entre tres pessoas vira R$ 3,34, R$ 3,33 e R$ 3,33. O centavo restante vai para a
          primeira pessoa na ordem do racha para manter consistencia.
        </Text>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
