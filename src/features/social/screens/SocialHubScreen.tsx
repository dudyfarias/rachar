import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Copy, History, Store, UsersRound, WalletCards } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button, Card, Header, Input } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { useAuthStore } from '../../../stores/authStore';
import { useSocialStore } from '../../../stores/socialStore';
import type { RootStackParamList } from '../../../types/navigation';

type SocialNavigation = NativeStackNavigationProp<RootStackParamList, 'SocialHub'>;

export function SocialHubScreen() {
  const navigation = useNavigation<SocialNavigation>();
  const userId = useAuthStore((state) => state.user?.id);
  const analyticsEvents = useSocialStore((state) => state.analyticsEvents);
  const billHistory = useSocialStore((state) => state.billHistory);
  const createRecurringGroup = useSocialStore((state) => state.createRecurringGroup);
  const pixProfile = useSocialStore((state) => state.pixProfile);
  const recentFriends = useSocialStore((state) => state.recentFriends);
  const recurringGroups = useSocialStore((state) => state.recurringGroups);
  const restaurantHistory = useSocialStore((state) => state.restaurantHistory);
  const track = useSocialStore((state) => state.track);
  const updatePixProfile = useSocialStore((state) => state.updatePixProfile);
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
    Alert.alert('Pix salvo', 'Chave Pix atualizada para os proximos rachas.');
  }

  async function handleCopyPixKey() {
    if (!pixKey.trim()) {
      Alert.alert('Pix vazio', 'Cadastre sua chave Pix antes de copiar.');
      return;
    }

    await Clipboard.setStringAsync(pixKey.trim());
    track('pix_key_copied', { source: 'social_hub' });
    Alert.alert('Chave copiada', 'A chave Pix foi enviada para a area de transferencia.');
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
    Alert.alert('Grupo salvo', 'Grupo recorrente criado para os proximos rachas.');
  }

  return (
    <View className="flex-1 bg-background" testID="screen-social">
      <Header eyebrow="Carteira e historico" onBack={navigation.goBack} testID="social-header" title="Social e Pix" />

      <ScrollView contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} testID="social-scroll">
        <Card className="bg-ink-900">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-money-500">
              <WalletCards color="#0F172A" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-white">Perfil Pix</Text>
              <Text className="mt-1 text-sm text-white/70">Base para copia e cola, QR Code e gateways futuros.</Text>
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

        <View className="mt-5 flex-row gap-3">
          <Card className="flex-1">
            <History color="#00A676" size={22} />
            <Text className="mt-3 text-2xl font-black text-ink-900">{billHistory.length}</Text>
            <Text className="text-sm text-ink-500">rachas salvos</Text>
          </Card>
          <Card className="flex-1">
            <UsersRound color="#00A676" size={22} />
            <Text className="mt-3 text-2xl font-black text-ink-900">{recurringGroups.length}</Text>
            <Text className="text-sm text-ink-500">grupos recorrentes</Text>
          </Card>
        </View>

        <Card className="mt-5">
          <Text className="text-lg font-black text-ink-900">Historico avancado</Text>
          <View className="mt-4 gap-3">
            {billHistory.length === 0 ? (
              <Text className="text-sm text-ink-500">Finalize rachas para montar um historico detalhado.</Text>
            ) : (
              billHistory.slice(0, 6).map((bill) => (
                <View
                  key={bill.id}
                  className="flex-row justify-between gap-4 border-b border-ink-100 pb-3 last:border-b-0 last:pb-0"
                  testID={`social-history-row-${bill.id}`}
                >
                  <View className="flex-1">
                    <Text className="font-black text-ink-900">{bill.title}</Text>
                    <Text className="mt-1 text-xs text-ink-500">
                      {bill.place || 'Sem restaurante'} - {bill.peopleCount} pessoa(s) -{' '}
                      {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-brand-700">{formatCurrency(bill.totalInCents)}</Text>
                </View>
              ))
            )}
          </View>
        </Card>

        <Card className="mt-5">
          <Text className="text-lg font-black text-ink-900">Amigos recentes</Text>
          <View className="mt-4 gap-3">
            {recentFriends.length === 0 ? (
              <Text className="text-sm text-ink-500">Finalize rachas para montar sua lista de amigos recentes.</Text>
            ) : (
              recentFriends.slice(0, 6).map((friend) => (
                <View key={friend.id} className="flex-row items-center justify-between gap-3" testID={`social-friend-row-${friend.id}`}>
                  <View className="flex-row flex-1 items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: friend.avatar.backgroundColor }}>
                      <Text className="font-black text-white">{friend.avatar.initials}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-black text-ink-900">{friend.name}</Text>
                      <Text className="text-xs text-ink-500">{friend.totalBills} racha(s)</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold text-brand-700">{formatCurrency(friend.totalInCents)}</Text>
                </View>
              ))
            )}
          </View>
        </Card>

        <Card className="mt-5">
          <View className="flex-row items-center gap-2">
            <Store color="#00A676" size={20} />
            <Text className="text-lg font-black text-ink-900">Restaurantes</Text>
          </View>
          <View className="mt-4 gap-3">
            {restaurantHistory.length === 0 ? (
              <Text className="text-sm text-ink-500">Restaurantes aparecem aqui depois dos primeiros rachas finalizados.</Text>
            ) : (
              restaurantHistory.slice(0, 6).map((restaurant) => (
                <View key={restaurant.id} className="flex-row justify-between gap-4" testID={`social-restaurant-row-${restaurant.id}`}>
                  <View className="flex-1">
                    <Text className="font-black text-ink-900">{restaurant.name}</Text>
                    <Text className="text-xs text-ink-500">
                      {restaurant.totalBills} visita(s) - media {formatCurrency(restaurant.averageTicketInCents)}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-ink-700">{formatCurrency(restaurant.totalInCents)}</Text>
                </View>
              ))
            )}
          </View>
        </Card>

        <Card className="mt-5">
          <Text className="text-lg font-black text-ink-900">Grupos recorrentes</Text>
          <View className="mt-4 gap-3 rounded-2xl bg-ink-50 p-4">
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
          <View className="mt-4 gap-3">
            {recurringGroups.length === 0 ? (
              <Text className="text-sm text-ink-500">Grupos com duas ou mais pessoas sao salvos automaticamente.</Text>
            ) : (
              recurringGroups.slice(0, 5).map((group) => (
                <View key={group.id} testID={`social-group-row-${group.id}`}>
                  <Text className="font-black text-ink-900">{group.name}</Text>
                  <Text className="mt-1 text-sm text-ink-500">
                    {group.memberNames.join(', ')} - {group.billCount} racha(s)
                  </Text>
                </View>
              ))
            )}
          </View>
        </Card>

        <Card className="mt-5">
          <Text className="text-lg font-black text-ink-900">Eventos de retencao</Text>
          <View className="mt-4 gap-3">
            {analyticsEvents.slice(0, 5).map((event) => (
              <View key={event.id} className="flex-row justify-between gap-3" testID={`social-event-row-${event.id}`}>
                <Text className="flex-1 text-sm font-bold text-ink-700">{event.name}</Text>
                <Text className="text-xs text-ink-500">{new Date(event.timestamp).toLocaleDateString('pt-BR')}</Text>
              </View>
            ))}
            {analyticsEvents.length === 0 ? <Text className="text-sm text-ink-500">Eventos aparecem conforme o app e usado.</Text> : null}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
