import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Button, Card, FlowStepHeader, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import { useBillStore } from '../../../stores/billStore';
import { useReceiptStore } from '../../../stores/receiptStore';
import type { RootStackParamList } from '../../../types/navigation';

type ReceiptReviewNavigation = NativeStackNavigationProp<RootStackParamList, 'ReceiptReview'>;

export function ReceiptReviewScreen() {
  const navigation = useNavigation<ReceiptReviewNavigation>();
  const receipt = useReceiptStore((state) => state.receipt);
  const resetReceipt = useReceiptStore((state) => state.reset);
  const importReceiptDraft = useBillStore((state) => state.importReceiptDraft);
  const hasBlockingWarning = receipt?.warnings.some((warning) => warning.severity === 'error') ?? false;

  function handleUseReceipt() {
    if (!receipt || hasBlockingWarning) {
      return;
    }

    importReceiptDraft(receipt);
    navigation.navigate('AddPeople');
  }

  function handleCaptureAgain() {
    resetReceipt();
    navigation.navigate('ReceiptCapture');
  }

  if (!receipt) {
    return (
      <View className="flex-1 bg-background" testID="screen-receipt-review-empty">
        <Header eyebrow="Passo 2 de 5" onBack={navigation.goBack} testID="receipt-review-empty-header" title="Conferir nota" />
        <FlowStepHeader currentStep={2} testID="receipt-review-empty-flow-steps" />
        <View className="flex-1 justify-center px-5">
          <Card>
            <Text className="text-xl font-black text-ink-900">Nenhuma leitura encontrada</Text>
            <Text className="mt-2 text-base leading-6 text-ink-500">Capture uma conta para abrir a conferencia.</Text>
            <Button className="mt-5" testID="receipt-review-capture-button" title="Capturar conta" onPress={handleCaptureAgain} />
          </Card>
        </View>
      </View>
    );
  }

  const calculatedTotal = receipt.subtotalInCents + receipt.serviceFeeInCents - receipt.discountInCents;
  const totalMatches = Math.abs(calculatedTotal - receipt.totalInCents) <= 2;

  return (
    <View className="flex-1 bg-background" testID="screen-receipt-review">
      <Header
        eyebrow="Passo 2 de 5"
        onBack={navigation.goBack}
        right={
          <Button
            accessibilityLabel="Capturar novamente"
            className="h-10 w-10 px-0"
            leftIcon={<RotateCcw color="#0F172A" size={18} />}
            testID="receipt-review-capture-again-button"
            variant="ghost"
            onPress={handleCaptureAgain}
          />
        }
        testID="receipt-review-header"
        title="Conferir nota"
      />
      <FlowStepHeader currentStep={2} testID="receipt-review-flow-steps" />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="receipt-review-scroll">
        <Card variant="dark">
          <Text className="text-sm font-bold uppercase tracking-[1px] text-white/70">
            {receipt.restaurantName || 'Restaurante nao identificado'}
          </Text>
          <Text className="mt-3 text-4xl font-black text-white">{formatCurrency(receipt.totalInCents)}</Text>
          <View className="mt-4 flex-row items-center gap-2">
            {totalMatches ? <CheckCircle2 color="#B6F000" size={18} /> : <AlertTriangle color="#FBBF24" size={18} />}
            <Text className="text-sm font-bold text-white/75">{totalMatches ? 'Total validado' : 'Total pede revisao'}</Text>
          </View>
        </Card>

        {receipt.warnings.length > 0 ? (
          <View className="mt-5 gap-3">
            {receipt.warnings.map((warning, index) => (
              <Card key={`${warning.code}-${index}`} className={warning.severity === 'error' ? 'border-danger' : undefined} testID={`receipt-review-warning-${index}`}>
                <View className="flex-row gap-3">
                  <AlertTriangle color={warning.severity === 'error' ? '#EF4444' : '#F59E0B'} size={20} />
                  <View className="flex-1">
                    <Text className="text-sm font-black text-ink-900">{warning.code}</Text>
                    <Text className="mt-1 text-sm leading-5 text-ink-500">{warning.message}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        <Card className="mt-5">
          <Text className="text-lg font-black text-ink-900">Resumo</Text>
          <View className="mt-4 gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-ink-500">Subtotal</Text>
              <Text className="text-sm font-bold text-ink-900">{formatCurrency(receipt.subtotalInCents)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-ink-500">Taxa</Text>
              <Text className="text-sm font-bold text-ink-900">{formatCurrency(receipt.serviceFeeInCents)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-ink-500">Desconto</Text>
              <Text className="text-sm font-bold text-brand-700">- {formatCurrency(receipt.discountInCents)}</Text>
            </View>
          </View>
        </Card>

        <View className="mt-5 gap-3">
          {receipt.items.map((item) => (
            <Card key={item.id} testID={`receipt-review-item-${item.id}`}>
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-base font-black text-ink-900">{item.name}</Text>
                  <Text className="mt-1 text-sm text-ink-500">
                    {item.quantity} x {formatCurrency(item.unitPriceInCents)}
                  </Text>
                </View>
                <Text className="text-base font-black text-brand-700">{formatCurrency(item.totalInCents)}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        <Button disabled={hasBlockingWarning} size="lg" testID="receipt-review-use-button" title="Conferir pessoas" onPress={handleUseReceipt} />
      </View>
    </View>
  );
}
