import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Trash2, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, Header, Input } from '../../../components/ui';
import { useBillStore } from '../../../stores/billStore';
import type { RootStackParamList } from '../../../types/navigation';

type AddPeopleNavigation = NativeStackNavigationProp<RootStackParamList, 'AddPeople'>;

export function AddPeopleScreen() {
  const navigation = useNavigation<AddPeopleNavigation>();
  const people = useBillStore((state) => state.draft.people);
  const addPerson = useBillStore((state) => state.addPerson);
  const assignEmptyItemsToAllPeople = useBillStore((state) => state.assignEmptyItemsToAllPeople);
  const removePerson = useBillStore((state) => state.removePerson);
  const [personName, setPersonName] = useState('');

  function handleAddPerson() {
    if (!personName.trim()) {
      return;
    }

    addPerson(personName);
    setPersonName('');
  }

  function handleContinue() {
    if (people.length === 0) {
      Alert.alert('Adicione pessoas', 'Inclua pelo menos uma pessoa para dividir a conta.');
      return;
    }

    assignEmptyItemsToAllPeople();
    navigation.navigate('AddItems');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <Header eyebrow="Passo 2 de 4" onBack={navigation.goBack} title="Adicionar pessoas" />
      <ScrollView contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card>
          <Text className="text-lg font-black text-ink-900">Quem participou?</Text>
          <Text className="mt-1 text-sm leading-5 text-ink-500">
            Pessoas podem aparecer em itens diferentes. A divisao final respeita essa selecao.
          </Text>
          <View className="mt-5 flex-row gap-2">
            <Input
              containerClassName="flex-1"
              label="Nome"
              onChangeText={setPersonName}
              onSubmitEditing={handleAddPerson}
              placeholder="Ana, Dudu, Joao..."
              returnKeyType="done"
              value={personName}
            />
            <Button
              accessibilityLabel="Adicionar pessoa"
              className="mt-7 h-12 w-12 px-0"
              leftIcon={<UserPlus color="#FFFFFF" size={20} />}
              onPress={handleAddPerson}
            />
          </View>
        </Card>

        <View className="mt-5 gap-3">
          {people.length === 0 ? (
            <Card className="items-center py-8">
              <Text className="text-center text-base font-bold text-ink-700">Nenhuma pessoa adicionada ainda.</Text>
              <Text className="mt-1 text-center text-sm text-ink-500">Comece adicionando quem vai entrar no racha.</Text>
            </Card>
          ) : (
            people.map((person, index) => (
              <Card key={person.id} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                    <Text className="font-black text-brand-700">{index + 1}</Text>
                  </View>
                  <Text className="text-base font-black text-ink-900">{person.name}</Text>
                </View>
                <Pressable accessibilityLabel={`Remover ${person.name}`} accessibilityRole="button" onPress={() => removePerson(person.id)}>
                  <Trash2 color="#EF4444" size={20} />
                </Pressable>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        <Button size="lg" title="Adicionar itens" onPress={handleContinue} />
      </View>
    </KeyboardAvoidingView>
  );
}
