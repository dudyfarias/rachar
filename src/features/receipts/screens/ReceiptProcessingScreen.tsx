import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Loader2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Header } from '../../../components/ui';
import { cn } from '../../../lib/cn';
import { processReceiptImage } from '../../../services/receipts/receiptProcessing';
import { useAuthStore } from '../../../stores/authStore';
import { useReceiptStore } from '../../../stores/receiptStore';
import type { ReceiptProcessingStep } from '../../../types/receipt';
import type { RootStackParamList } from '../../../types/navigation';

type ReceiptProcessingProps = NativeStackScreenProps<RootStackParamList, 'ReceiptProcessing'>;

const steps: Array<{ key: ReceiptProcessingStep; label: string }> = [
  { key: 'prepare-image', label: 'Crop e compressao' },
  { key: 'upload-image', label: 'Upload da imagem' },
  { key: 'ocr', label: 'OCR' },
  { key: 'ai-parser', label: 'Parser de IA' },
  { key: 'validate', label: 'Validacao do total' },
];

export function ReceiptProcessingScreen({ navigation, route }: ReceiptProcessingProps) {
  const hasStarted = useRef(false);
  const user = useAuthStore((state) => state.user);
  const currentStep = useReceiptStore((state) => state.currentStep);
  const error = useReceiptStore((state) => state.error);
  const setError = useReceiptStore((state) => state.setError);
  const setImage = useReceiptStore((state) => state.setImage);
  const setResult = useReceiptStore((state) => state.setResult);
  const setStep = useReceiptStore((state) => state.setStep);

  const runProcessing = useCallback(async () => {
    try {
      setError(null);
      setImage(route.params.image);
      const result = await processReceiptImage({
        image: route.params.image,
        onStep: setStep,
        userId: user?.id,
      });

      setResult(result);
      navigation.replace('ReceiptReview');
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Nao foi possivel processar a conta.');
    }
  }, [navigation, route.params.image, setError, setImage, setResult, setStep, user?.id]);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    runProcessing();
  }, [runProcessing]);

  return (
    <View className="flex-1 bg-background" testID="screen-receipt-processing">
      <Header eyebrow="OCR + IA" onBack={navigation.goBack} testID="receipt-processing-header" title="Processamento" />

      <View className="flex-1 justify-center px-5">
        <Card>
          <View className="items-center py-2">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <Loader2 color="#00A676" size={32} />
            </View>
            <Text className="mt-4 text-center text-2xl font-black text-ink-900">
              {error ? 'Algo saiu do trilho' : 'Lendo a comanda'}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-ink-500">
              {error || 'Estamos preparando a imagem, extraindo texto e estruturando os dados.'}
            </Text>
          </View>

          <View className="mt-5 gap-3">
            {steps.map((step) => {
              const isDone = steps.findIndex((item) => item.key === currentStep) > steps.findIndex((item) => item.key === step.key);
              const isActive = currentStep === step.key && !error;

              return (
                <View key={step.key} className="flex-row items-center gap-3" testID={`receipt-processing-step-${step.key}`}>
                  <View
                    className={cn(
                      'h-8 w-8 items-center justify-center rounded-full',
                      isDone ? 'bg-brand-500' : isActive ? 'bg-brand-50' : 'bg-ink-100',
                    )}
                  >
                    {isDone ? <CheckCircle2 color="#FFFFFF" size={17} /> : <Text className="text-xs font-black text-ink-500"> </Text>}
                  </View>
                  <Text className={cn('text-sm font-bold', isActive ? 'text-brand-700' : 'text-ink-500')}>{step.label}</Text>
                </View>
              );
            })}
          </View>

          {error ? (
            <View className="mt-6 gap-3">
              <Button testID="receipt-processing-retry-button" title="Tentar novamente" onPress={runProcessing} />
              <Button testID="receipt-processing-back-button" title="Voltar para captura" variant="ghost" onPress={navigation.goBack} />
            </View>
          ) : null}
        </Card>
      </View>
    </View>
  );
}
