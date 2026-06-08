import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Copy, QrCode, Send, Share2 } from 'lucide-react-native';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, Text, View } from 'react-native';

import { Button, Card, FlowStepHeader, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { calculateSplits } from '../../../services/billing/calculateSplits';
import { generateWhatsAppSummary } from '../../../services/social/generateWhatsAppSummary';
import { createPixGatewayProvider, type PixCharge } from '../../../services/social/pix';
import { useAuthStore } from '../../../stores/authStore';
import { useBillStore } from '../../../stores/billStore';
import { useSocialStore } from '../../../stores/socialStore';
import type { RootStackParamList } from '../../../types/navigation';

type ResultNavigation = NativeStackNavigationProp<RootStackParamList, 'Result'>;

const QRCode = lazy(() => import('react-native-qrcode-svg'));

export function ResultScreen() {
  const navigation = useNavigation<ResultNavigation>();
  const draft = useBillStore((state) => state.draft);
  const resetDraft = useBillStore((state) => state.resetDraft);
  const userId = useAuthStore((state) => state.user?.id);
  const pixProfile = useSocialStore((state) => state.pixProfile);
  const recordFinishedBill = useSocialStore((state) => state.recordFinishedBill);
  const track = useSocialStore((state) => state.track);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);

  const result = useMemo(() => {
    try {
      return { data: calculateSplits(draft), error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Nao foi possivel calcular.' };
    }
  }, [draft]);

  useEffect(() => {
    async function createPixCharge() {
      if (!result.data || !pixProfile.key.trim()) {
        setPixCharge(null);
        return;
      }

      const provider = createPixGatewayProvider();
      const charge = await provider.createCharge({
        amountInCents: result.data.totalInCents,
        description: pixProfile.description || draft.title || 'Racha Rachae',
        profile: pixProfile,
      });

      setPixCharge(charge);
      track('pix_qr_viewed', { provider: charge.provider, totalInCents: charge.amountInCents });
    }

    createPixCharge();
  }, [draft.title, pixProfile, result.data, track]);

  function finishFlow() {
    if (result.data) {
      recordFinishedBill({ draft, result: result.data }, userId);
    }

    resetDraft();
    navigation.navigate('Home');
  }

  async function handleShare() {
    if (!result.data) {
      Alert.alert('Resultado indisponivel', result.error || 'Revise os dados da conta.');
      return;
    }

    const summary = generateWhatsAppSummary({
      draft,
      pixCopyPaste: pixCharge?.copyPaste,
      pixKey: pixProfile.key,
      result: result.data,
    });
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(summary)}`;

    try {
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);

      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({ message: summary });
      }

      track('whatsapp_summary_shared', { people: result.data.people.length, totalInCents: result.data.totalInCents });
    } catch (error) {
      await Share.share({ message: summary });
    }
  }

  async function handleCopyPixKey() {
    if (!pixProfile.key.trim()) {
      Alert.alert('Pix nao configurado', 'Cadastre sua chave Pix na area Social e Pix.');
      return;
    }

    await Clipboard.setStringAsync(pixProfile.key.trim());
    track('pix_key_copied', { source: 'result' });
    Alert.alert('Chave copiada', 'Chave Pix copiada para a area de transferencia.');
  }

  async function handleCopyPixPayload() {
    if (!pixCharge) {
      Alert.alert('Pix indisponivel', 'Configure sua chave Pix para gerar copia e cola.');
      return;
    }

    await Clipboard.setStringAsync(pixCharge.copyPaste);
    track('pix_key_copied', { source: 'copy_paste' });
    Alert.alert('Pix copiado', 'Codigo Pix copia e cola copiado.');
  }

  if (!result.data) {
    return (
      <View className="flex-1 bg-background" testID="screen-result-error">
        <Header eyebrow="Passo 4 de 4" onBack={navigation.goBack} testID="result-error-header" title="Resultado" />
        <FlowStepHeader currentStep={4} steps={['Conta', 'Pessoas', 'Itens', 'Resultado']} testID="result-error-flow-steps" />
        <View className="flex-1 justify-center px-5">
          <Card>
            <Text className="text-xl font-black text-ink-900">Revise o racha</Text>
            <Text className="mt-2 text-base leading-6 text-ink-500">{result.error}</Text>
            <Button className="mt-5" testID="result-back-to-items-button" title="Voltar para itens" onPress={navigation.goBack} />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" testID="screen-result">
      <Header
        eyebrow="Passo 4 de 4"
        onBack={navigation.goBack}
        right={
          <Pressable
            accessibilityLabel="Compartilhar"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={handleShare}
            testID="result-share-icon-button"
          >
            <Share2 color="#0F172A" size={19} />
          </Pressable>
        }
        testID="result-header"
        title="Resultado"
      />
      <FlowStepHeader currentStep={4} steps={['Conta', 'Pessoas', 'Itens', 'Resultado']} testID="result-flow-steps" />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="result-scroll">
        <Card variant="brand">
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

        <Card className="mt-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
              <Send color="#00A676" size={19} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-ink-900">Compartilhar no WhatsApp</Text>
              <Text className="mt-1 text-sm text-ink-500">Resumo com valores por pessoa e Pix quando configurado.</Text>
            </View>
          </View>
          <Button className="mt-5" testID="result-share-summary-button" title="Enviar resumo" onPress={handleShare} />
        </Card>

        <Card className="mt-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
              <QrCode color="#00A676" size={19} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-ink-900">Pix do racha</Text>
              <Text className="mt-1 text-sm text-ink-500">
                {pixCharge ? 'QR Code Pix e copia e cola gerados localmente.' : 'Configure sua chave Pix para gerar cobranca.'}
              </Text>
            </View>
          </View>

          {pixCharge ? (
            <View className="mt-5 items-center gap-4">
              <View className="rounded-2xl border border-ink-100 bg-white p-4">
                <Suspense fallback={<Text className="p-8 text-sm font-bold text-ink-500">Gerando QR Code...</Text>}>
                  <QRCode size={180} value={pixCharge.qrValue} />
                </Suspense>
              </View>
              <View className="w-full flex-row gap-3">
                <Button
                  className="flex-1"
                  leftIcon={<Copy color="#FFFFFF" size={18} />}
                  testID="result-copy-pix-payload-button"
                  title="Copiar Pix"
                  onPress={handleCopyPixPayload}
                />
                <Button className="flex-1" testID="result-copy-pix-key-button" title="Copiar chave" variant="secondary" onPress={handleCopyPixKey} />
              </View>
            </View>
          ) : (
            <Button className="mt-5" testID="result-configure-pix-button" title="Configurar Pix" variant="secondary" onPress={() => navigation.navigate('SocialHub')} />
          )}
        </Card>

        <View className="mt-5 gap-3">
          {result.data.people.map((person) => (
            <Card key={person.personId} testID={`result-person-card-${person.personId}`}>
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
        <Button size="lg" testID="result-finish-button" title="Finalizar racha" onPress={finishFlow} />
      </View>
    </View>
  );
}
