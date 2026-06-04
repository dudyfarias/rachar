import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  Camera,
  CheckCircle2,
  History,
  LogIn,
  LogOut,
  Plus,
  ReceiptText,
  Send,
  Sparkles,
  UsersRound,
  WalletCards,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { useAuthStore } from '../../../stores/authStore';
import { useBillStore } from '../../../stores/billStore';
import { useSocialStore } from '../../../stores/socialStore';
import type { RootStackParamList } from '../../../types/navigation';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const flowFeatures = [
  {
    description: 'OCR + IA',
    icon: Sparkles,
    testID: 'home-feature-ocr',
    title: 'Conferir leitura',
  },
  {
    description: 'por item',
    icon: UsersRound,
    testID: 'home-feature-split',
    title: 'Dividir consumo',
  },
  {
    description: 'Pix e WhatsApp',
    icon: Send,
    testID: 'home-feature-share',
    title: 'Enviar cobranca',
  },
  {
    description: 'grupos e historico',
    icon: History,
    testID: 'home-feature-history',
    title: 'Repetir rachas',
  },
];

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const draft = useBillStore((state) => state.draft);
  const resetDraft = useBillStore((state) => state.resetDraft);
  const signOut = useAuthStore((state) => state.signOut);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const billHistory = useSocialStore((state) => state.billHistory);
  const recentFriends = useSocialStore((state) => state.recentFriends);
  const recurringGroups = useSocialStore((state) => state.recurringGroups);
  const track = useSocialStore((state) => state.track);
  const subtotal = draft.items.reduce((sum, item) => sum + item.priceInCents, 0);

  useEffect(() => {
    track('retention_return_home', { bills: billHistory.length });
  }, [billHistory.length, track]);

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

  function startReceiptCapture() {
    navigation.navigate('ReceiptCapture');
  }

  return (
    <View className="flex-1 bg-background" testID="screen-home">
      <Header
        eyebrow="Rachae"
        right={
          session ? (
            <Pressable
              accessibilityLabel="Sair"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
              onPress={handleSignOut}
              testID="home-sign-out-button"
            >
              <LogOut color="#0F172A" size={19} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="Entrar"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
              testID="home-login-button"
              onPress={() => navigation.navigate('Login')}
            >
              <LogIn color="#0F172A" size={19} />
            </Pressable>
          )
        }
        testID="home-header"
        title="Escanear nota"
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="home-scroll">
        <View className="rounded-[28px] bg-ink-900 p-5" testID="home-scan-panel">
          <Text className="text-sm font-bold text-white/70">
            Ola, {user?.user_metadata?.full_name || user?.email || 'time Rachae'}
          </Text>

          <View className="mt-5 rounded-3xl border-2 border-dashed border-white/30 bg-white/10 px-5 py-8">
            <View className="self-center rounded-full bg-money-500 p-5">
              <Camera color="#0F172A" size={42} />
            </View>
            <Text className="mt-6 text-center text-4xl font-black leading-tight text-white">Escaneie a nota</Text>
            <Text className="mt-3 text-center text-base leading-6 text-white/75">
              A captura vem primeiro. Depois entram conferencia, pessoas, Pix e compartilhamento.
            </Text>
          </View>

          <Button
            className="mt-6 bg-money-500"
            leftIcon={<Camera color="#0F172A" size={20} />}
            testID="home-receipt-capture-button"
            textClassName="text-ink-900"
            title="Escanear nota agora"
            onPress={startReceiptCapture}
          />
        </View>

        <View className="mt-5" testID="home-feature-section">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-black uppercase tracking-[1px] text-brand-600">Depois do scan</Text>
              <Text className="mt-1 text-2xl font-black text-ink-900">Features do fluxo</Text>
            </View>
            <CheckCircle2 color="#00A676" size={24} />
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3">
              {flowFeatures.slice(0, 2).map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card key={feature.title} className="flex-1" testID={feature.testID}>
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                      <Icon color="#00A676" size={22} />
                    </View>
                    <Text className="mt-4 text-base font-black text-ink-900">{feature.title}</Text>
                    <Text className="mt-1 text-sm font-bold text-ink-500">{feature.description}</Text>
                  </Card>
                );
              })}
            </View>
            <View className="flex-row gap-3">
              {flowFeatures.slice(2).map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card key={feature.title} className="flex-1" testID={feature.testID}>
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                      <Icon color="#00A676" size={22} />
                    </View>
                    <Text className="mt-4 text-base font-black text-ink-900">{feature.title}</Text>
                    <Text className="mt-1 text-sm font-bold text-ink-500">{feature.description}</Text>
                  </Card>
                );
              })}
            </View>
          </View>
        </View>

        <View className="mt-5 gap-3">
          <Button
            leftIcon={<Plus color="#FFFFFF" size={20} />}
            testID="home-new-bill-button"
            title="Criar manualmente"
            variant="secondary"
            onPress={startNewBill}
          />
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              leftIcon={<WalletCards color="#FFFFFF" size={18} />}
              testID="home-social-button"
              title="Pix"
              variant="secondary"
              onPress={() => navigation.navigate('SocialHub')}
            />
            <Button
              className="flex-1"
              leftIcon={<History color="#FFFFFF" size={18} />}
              testID="home-history-button"
              title="Historico"
              variant="secondary"
              onPress={() => navigation.navigate('BillHistory')}
            />
          </View>
        </View>

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

        <View className="mt-5 flex-row gap-3">
          <Card className="flex-1">
            <History color="#00A676" size={24} />
            <Text className="mt-3 text-2xl font-black text-ink-900">{billHistory.length}</Text>
            <Text className="text-sm text-ink-500">no historico</Text>
          </Card>
          <Card className="flex-1">
            <UsersRound color="#00A676" size={24} />
            <Text className="mt-3 text-2xl font-black text-ink-900">{recurringGroups.length}</Text>
            <Text className="text-sm text-ink-500">grupos</Text>
          </Card>
        </View>

        {recentFriends.length > 0 ? (
          <Card className="mt-5">
            <Text className="text-sm font-bold uppercase tracking-[1px] text-brand-600">Amigos recentes</Text>
            <View className="mt-4 flex-row">
              {recentFriends.slice(0, 5).map((friend, index) => (
                <View
                  key={friend.id}
                  className="h-11 w-11 items-center justify-center rounded-full border-2 border-white"
                  style={{ backgroundColor: friend.avatar.backgroundColor, marginLeft: index === 0 ? 0 : -8 }}
                >
                  <Text className="font-black text-white">{friend.avatar.initials}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}
