import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Copy, History, UsersRound, WalletCards } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, Header, Input } from '../../../components/ui';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/formatCurrency';
import { useAuthStore } from '../../../stores/authStore';
import { useSocialStore } from '../../../stores/socialStore';
import type { RootStackParamList } from '../../../types/navigation';

type SocialNavigation = NativeStackNavigationProp<RootStackParamList, 'SocialHub'>;
type SocialTab = 'activity' | 'groups' | 'pix';

const tabs: Array<{ key: SocialTab; label: string; testID: string }> = [
  { key: 'pix', label: 'Pix', testID: 'social-tab-pix' },
  { key: 'groups', label: 'Grupos', testID: 'social-tab-groups' },
  { key: 'activity', label: 'Atividade', testID: 'social-tab-activity' },
];

export function SocialHubScreen() {
  const navigation = useNavigation<SocialNavigation>();
  const userId = useAuthStore((state) => state.user?.id);
  const billHistory = useSocialStore((state) => state.billHistory);
  const createRecurringGroup = useSocialStore((state) => state.createRecurringGroup);
  const pixProfile = useSocialStore((state) => state.pixProfile);
  const recentFriends = useSocialStore((state) => state.recentFriends);
  const recurringGroups = useSocialStore((state) => state.recurringGroups);
  const restaurantHistory = useSocialStore((state) => state.restaurantHistory);
  const track = useSocialStore((state) => state.track);
  const updatePixProfile = useSocialStore((state) => state.updatePixProfile);
  const [activeTab, setActiveTab] = useState<SocialTab>('pix');
  const [pixKey, setPixKey] = useState(pixProfile.key);
  const [receiverName, setReceiverName] = useState(pixProfile.receiverName);
  const [city, setCity] = useState(pixProfile.city);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');

  useEffect(() => {
    track('history_opened', { bills: billHistory.length, groups: recurringGroups.length });
  }, [billHistory.length, recurringGroups.length, track]);

  useEffect(() => {
    setPixKey(pixProfile.key);
    setReceiverName(pixProfile.receiverName);
    setCity(pixProfile.city);
  }, [pixProfile.city, pixProfile.key, pixProfile.receiverName]);

  function handleSavePix() {
    updatePixProfile(
      {
        city: city.trim() || 'Sao Paulo',
        key: pixKey.trim(),
        receiverName: receiverName.trim(),
      },
      userId,
    );
    Alert.alert('Pix salvo', 'Vamos usar estes dados nos proximos rachas.');
  }

  async function handleCopyPixKey() {
    if (!pixKey.trim()) {
      Alert.alert('Pix vazio', 'Cadastre sua chave antes de copiar.');
      return;
    }

    await Clipboard.setStringAsync(pixKey.trim());
    track('pix_key_copied', { source: 'social_hub' });
    Alert.alert('Chave copiada', 'A chave Pix foi copiada.');
  }

  function handleCreateGroup() {
    const members = groupMembers
      .split(',')
      .map((member) => member.trim())
      .filter(Boolean);

    if (!groupName.trim() || members.length < 2) {
      Alert.alert('Grupo incompleto', 'Informe um nome e pelo menos duas pessoas separadas por virgula.');
      return;
    }

    createRecurringGroup(groupName.trim(), members, userId);
    setGroupName('');
    setGroupMembers('');
    Alert.alert('Grupo salvo', 'Ele ja pode ser usado nos proximos rachas.');
  }

  return (
    <View className="flex-1 bg-background" testID="screen-social">
      <Header eyebrow="Conta" onBack={navigation.goBack} testID="social-header" title="Pix e grupos" />

      <ScrollView contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} testID="social-scroll">
        <View className="flex-row rounded-2xl bg-ink-100 p-1" testID="social-tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                accessibilityLabel={tab.label}
                accessibilityRole="button"
                className={cn('h-11 flex-1 items-center justify-center rounded-xl', isActive ? 'bg-white shadow-sm' : 'bg-transparent')}
                testID={tab.testID}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text className={cn('text-sm font-black', isActive ? 'text-ink-900' : 'text-ink-500')}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'pix' ? (
          <View className="mt-5 gap-5" testID="social-tab-panel-pix">
            <Card>
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-50">
                  <WalletCards color="#00A676" size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-black text-ink-900">Dados de recebimento</Text>
                  <Text className="mt-1 text-sm text-ink-500">Salve uma chave para gerar cobrancas mais rapido.</Text>
                </View>
              </View>

              <View className="mt-5 gap-4">
                <Input
                  label="Chave Pix"
                  onChangeText={setPixKey}
                  placeholder="email, telefone, CPF/CNPJ ou chave aleatoria"
                  testID="social-pix-key-input"
                  value={pixKey}
                />
                <Input label="Nome do recebedor" onChangeText={setReceiverName} placeholder="Seu nome" testID="social-pix-receiver-input" value={receiverName} />
                <Input label="Cidade" onChangeText={setCity} placeholder="Sao Paulo" testID="social-pix-city-input" value={city} />
              </View>

              <View className="mt-5 flex-row gap-3">
                <Button className="flex-1" testID="social-save-pix-button" title="Salvar Pix" onPress={handleSavePix} />
                <Button
                  accessibilityLabel="Copiar chave Pix"
                  className="h-12 w-12 px-0"
                  leftIcon={<Copy color="#FFFFFF" size={18} />}
                  testID="social-copy-pix-button"
                  variant="secondary"
                  onPress={handleCopyPixKey}
                />
              </View>
            </Card>

            <Card variant="soft">
              <Text className="text-base font-black text-ink-900">Onde isso aparece?</Text>
              <Text className="mt-2 text-sm leading-5 text-ink-600">
                No resultado do racha, o app mostra a opcao de copiar Pix e compartilhar o resumo.
              </Text>
            </Card>
          </View>
        ) : null}

        {activeTab === 'groups' ? (
          <View className="mt-5 gap-5" testID="social-tab-panel-groups">
            <Card>
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-50">
                  <UsersRound color="#00A676" size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-black text-ink-900">Grupo recorrente</Text>
                  <Text className="mt-1 text-sm text-ink-500">Use para repetir rachas com as mesmas pessoas.</Text>
                </View>
              </View>

              <View className="mt-5 gap-4">
                <Input label="Nome do grupo" onChangeText={setGroupName} placeholder="Sextou da firma" testID="social-group-name-input" value={groupName} />
                <Input
                  label="Pessoas"
                  onChangeText={setGroupMembers}
                  placeholder="Ana, Bruno, Carla"
                  testID="social-group-members-input"
                  value={groupMembers}
                />
                <Button testID="social-save-group-button" title="Salvar grupo" onPress={handleCreateGroup} />
              </View>
            </Card>

            <View className="gap-3">
              {recurringGroups.length === 0 ? (
                <Card className="items-center py-8">
                  <Text className="text-center text-base font-bold text-ink-700">Nenhum grupo salvo ainda.</Text>
                  <Text className="mt-1 text-center text-sm text-ink-500">Crie um grupo para acelerar os proximos rachas.</Text>
                </Card>
              ) : (
                recurringGroups.map((group) => (
                  <Card key={group.id} testID={`social-group-row-${group.id}`}>
                    <Text className="font-black text-ink-900">{group.name}</Text>
                    <Text className="mt-1 text-sm text-ink-500">
                      {group.memberNames.join(', ')} - {group.billCount} racha(s)
                    </Text>
                  </Card>
                ))
              )}
            </View>
          </View>
        ) : null}

        {activeTab === 'activity' ? (
          <View className="mt-5 gap-5" testID="social-tab-panel-activity">
            <View className="flex-row gap-3">
              <Card className="flex-1">
                <History color="#00A676" size={22} />
                <Text className="mt-3 text-2xl font-black text-ink-900">{billHistory.length}</Text>
                <Text className="text-sm text-ink-500">rachas</Text>
              </Card>
              <Card className="flex-1">
                <UsersRound color="#00A676" size={22} />
                <Text className="mt-3 text-2xl font-black text-ink-900">{recentFriends.length}</Text>
                <Text className="text-sm text-ink-500">pessoas</Text>
              </Card>
            </View>

            <Card>
              <Text className="text-lg font-black text-ink-900">Ultimos rachas</Text>
              <View className="mt-4 gap-3">
                {billHistory.length === 0 ? (
                  <Text className="text-sm text-ink-500">Finalize uma conta para montar seu historico.</Text>
                ) : (
                  billHistory.slice(0, 5).map((bill) => (
                    <View key={bill.id} className="flex-row justify-between gap-4 border-b border-ink-100 pb-3 last:border-b-0 last:pb-0" testID={`social-history-row-${bill.id}`}>
                      <View className="flex-1">
                        <Text className="font-black text-ink-900">{bill.title}</Text>
                        <Text className="mt-1 text-xs text-ink-500">
                          {bill.place || 'Sem local'} - {bill.peopleCount} pessoa(s)
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-brand-700">{formatCurrency(bill.totalInCents)}</Text>
                    </View>
                  ))
                )}
              </View>
            </Card>

            {restaurantHistory.length > 0 ? (
              <Card>
                <Text className="text-lg font-black text-ink-900">Restaurantes</Text>
                <View className="mt-4 gap-3">
                  {restaurantHistory.slice(0, 5).map((restaurant) => (
                    <View key={restaurant.id} className="flex-row justify-between gap-4" testID={`social-restaurant-row-${restaurant.id}`}>
                      <View className="flex-1">
                        <Text className="font-black text-ink-900">{restaurant.name}</Text>
                        <Text className="text-xs text-ink-500">
                          {restaurant.totalBills} visita(s) - media {formatCurrency(restaurant.averageTicketInCents)}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-ink-700">{formatCurrency(restaurant.totalInCents)}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
