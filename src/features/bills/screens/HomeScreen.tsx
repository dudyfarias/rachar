import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  Camera,
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

import { Button, Card, FlowStepHeader, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { useAuthStore } from '../../../stores/authStore';
import { useBillStore } from '../../../stores/billStore';
import { useSocialStore } from '../../../stores/socialStore';
import type { RootStackParamList } from '../../../types/navigation';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const flowSteps = [
  {
    description: 'A nota vira rascunho revisavel.',
    icon: Sparkles,
    testID: 'home-feature-ocr',
    title: 'Conferir',
  },
  {
    description: 'Cada item pode ter pessoas diferentes.',
    icon: UsersRound,
    testID: 'home-feature-split',
    title: 'Dividir',
  },
  {
    description: 'Resumo pronto para cobrar.',
    icon: Send,
    testID: 'home-feature-share',
    title: 'Enviar',
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
  const hasDraft = Boolean(draft.title || draft.place || draft.people.length > 0 || draft.items.length > 0 || subtotal > 0);

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

  function resumeDraft() {
    if (!draft.title.trim()) {
      navigation.navigate('NewBill');
      return;
    }

    if (draft.people.length === 0) {
      navigation.navigate('AddPeople');
      return;
    }

    if (draft.items.length === 0) {
      navigation.navigate('AddItems');
      return;
    }

    navigation.navigate('Result');
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
        title="Inicio"
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="home-scroll">
        {!session ? (
          <Card className="mb-5" testID="home-login-panel" variant="soft">
            <View className="flex-row items-start gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <LogIn color="#00A676" size={22} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-ink-900">Entre na sua conta</Text>
                <Text className="mt-1 text-sm leading-5 text-ink-600">
                  Salve historico, grupos e Pix para usar em qualquer dispositivo.
                </Text>
              </View>
            </View>
            <Button className="mt-5" testID="home-login-cta-button" title="Entrar" onPress={() => navigation.navigate('Login')} />
            <Button
              className="mt-3"
              testID="home-register-cta-button"
              title="Criar conta"
              variant="ghost"
              onPress={() => navigation.navigate('Register')}
            />
          </Card>
        ) : null}

        <Card className="rounded-[28px] p-5" testID="home-scan-panel" variant="dark">
          <Text className="text-sm font-bold text-white/70">Ola, {user?.user_metadata?.full_name || user?.email || 'time Rachae'}</Text>

          <View className="mt-5 rounded-3xl border border-white/15 bg-white/10 px-5 py-7">
            <View className="h-16 w-16 items-center justify-center self-center rounded-full bg-money-500">
              <Camera color="#0F172A" size={34} />
            </View>
            <Text className="mt-6 text-center text-4xl font-black leading-tight text-white">Escaneie a nota</Text>
            <Text className="mt-3 text-center text-base leading-6 text-white/75">
              Fotografe a conta e siga para conferencia, pessoas, itens e cobranca.
            </Text>
          </View>

          <View className="mt-6 gap-3">
            <Button
              leftIcon={<Camera color="#0F172A" size={20} />}
              testID="home-receipt-capture-button"
              title="Escanear agora"
              variant="money"
              onPress={startReceiptCapture}
            />
            <Button
              className="border border-white/15 bg-white/10"
              leftIcon={<Plus color="#FFFFFF" size={20} />}
              testID="home-new-bill-button"
              title="Criar manualmente"
              variant="secondary"
              onPress={startNewBill}
            />
          </View>
        </Card>

        <View className="mt-5" testID="home-feature-section">
          <Text className="text-sm font-black uppercase text-brand-600">Fluxo principal</Text>
          <Text className="mt-1 text-2xl font-black text-ink-900">Do scan ao Pix</Text>
          <FlowStepHeader className="px-0" currentStep={1} testID="home-flow-steps" />

          <View className="gap-3">
            {flowSteps.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="flex-row items-center gap-3" testID={feature.testID}>
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                    <Icon color="#00A676" size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-black text-ink-900">{feature.title}</Text>
                    <Text className="mt-1 text-sm text-ink-500">{feature.description}</Text>
                  </View>
                </Card>
              );
            })}
          </View>

          <Button
            className="mt-3"
            leftIcon={<Sparkles color="#00A676" size={18} />}
            testID="home-guided-tour-button"
            title="Ver o passo a passo"
            variant="ghost"
            onPress={() => navigation.navigate('Onboarding')}
          />
        </View>

        {hasDraft ? (
          <Card className="mt-5" variant="soft">
            <View className="flex-row items-start gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <ReceiptText color="#00A676" size={22} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-ink-900">Rascunho em andamento</Text>
                <Text className="mt-1 text-sm text-ink-600">
                  {draft.items.length} item(ns), {draft.people.length} pessoa(s), subtotal {formatCurrency(subtotal)}.
                </Text>
              </View>
            </View>
            <Button className="mt-5" testID="home-resume-draft-button" title="Continuar rascunho" onPress={resumeDraft} />
          </Card>
        ) : null}

        <View className="mt-5 flex-row gap-3">
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

        {billHistory.length > 0 || recurringGroups.length > 0 || recentFriends.length > 0 ? (
          <Card className="mt-5">
            <Text className="text-sm font-black uppercase text-brand-600">Seu historico</Text>
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-2xl font-black text-ink-900">{billHistory.length}</Text>
                <Text className="text-sm text-ink-500">rachas</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-black text-ink-900">{recurringGroups.length}</Text>
                <Text className="text-sm text-ink-500">grupos</Text>
              </View>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}
