import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Clock, RefreshCw, Share2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { Button, Card, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import * as billRepo from '../../../lib/supabase/billRepository';
import { useAuthStore } from '../../../stores/authStore';
import { useBillStore } from '../../../stores/billStore';
import { useSocialStore } from '../../../stores/socialStore';
import type { RootStackParamList } from '../../../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BillHistory'>;

export function BillHistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const user = useAuthStore((state) => state.user);
  const billHistory = useSocialStore((state) => state.billHistory);
  const loadFromSupabase = useSocialStore((state) => state.loadFromSupabase);
  const isSyncing = useSocialStore((state) => state.isSyncing);
  const loadBillAsTemplate = useBillStore((state) => state.loadBillAsTemplate);
  const isLoadingTemplate = useBillStore((state) => state.isLoadingTemplate);
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadFromSupabase(user.id);
    }
  }, [user?.id, loadFromSupabase]);

  const handleReopen = useCallback(async (billId: string) => {
    if (!isSupabaseConfigured) {
      Alert.alert('Indisponivel', 'Reconecte ao Supabase para reabrir contas.');
      return;
    }

    try {
      await loadBillAsTemplate(billId);
      navigation.navigate('AddPeople');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar a conta.');
    }
  }, [loadBillAsTemplate, navigation]);

  const handleShare = useCallback(async (billId: string) => {
    if (!isSupabaseConfigured) {
      Alert.alert('Indisponivel', 'Reconecte ao Supabase para compartilhar.');
      return;
    }

    setSharingId(billId);
    try {
      const token = await billRepo.generateShareToken(billId);
      const link = `rachae://bill/${token}`;
      await Clipboard.setStringAsync(link);
      Alert.alert('Link copiado!', 'Envie para os participantes.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel gerar o link.');
    } finally {
      setSharingId(null);
    }
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  return (
    <View className="flex-1 bg-background" testID="screen-bill-history">
      <Header title="Historico" eyebrow="Rachas anteriores" testID="bill-history-header" />
      {isSyncing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00A676" size="large" />
          <Text className="mt-3 text-sm text-ink-500">Sincronizando...</Text>
        </View>
      ) : billHistory.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Clock color="#64748B" size={48} />
          <Text className="mt-4 text-center text-base text-ink-500">
            Nenhum racha no historico ainda. Finalize uma conta para ela aparecer aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerClassName="px-5 pb-8"
          data={billHistory}
          keyExtractor={(item) => item.id}
          testID="bill-history-list"
          renderItem={({ item }) => (
            <Card className="mt-4" testID={`bill-history-card-${item.id}`}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-bold text-ink-900" numberOfLines={1}>
                    {item.title || 'Racha'}
                  </Text>
                  {item.place ? (
                    <Text className="mt-1 text-sm text-ink-500" numberOfLines={1}>
                      {item.place}
                    </Text>
                  ) : null}
                  <Text className="mt-1 text-xs text-ink-400">{formatDate(item.createdAt)}</Text>
                </View>
                <Text className="text-lg font-black text-brand-600">
                  {formatCurrency(item.totalInCents)}
                </Text>
              </View>
              <View className="mt-4 flex-row gap-3">
                <Button
                  className="flex-1"
                  leftIcon={<RefreshCw color="#FFFFFF" size={16} />}
                  testID={`bill-history-reopen-${item.id}`}
                  title={isLoadingTemplate ? 'Carregando...' : 'Reabrir'}
                  onPress={() => handleReopen(item.id)}
                />
                <Button
                  className="flex-1"
                  leftIcon={<Share2 color="#00A676" size={16} />}
                  testID={`bill-history-share-${item.id}`}
                  title={sharingId === item.id ? 'Gerando...' : 'Compartilhar'}
                  variant="secondary"
                  onPress={() => handleShare(item.id)}
                />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
