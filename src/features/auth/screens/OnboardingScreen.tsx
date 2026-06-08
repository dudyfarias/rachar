import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Camera, CheckCircle2, ChevronLeft, ReceiptText, Send, UsersRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '../../../components/ui';
import { cn } from '../../../lib/cn';
import { useAppStore } from '../../../stores/appStore';
import type { RootStackParamList } from '../../../types/navigation';

type OnboardingNavigation = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
type AuthRoute = 'Login' | 'Register';

const steps = [
  {
    checklist: ['Enquadre a conta inteira', 'Use camera ou galeria', 'O app segue em modo convidado'],
    description: 'A primeira acao do fluxo e capturar a conta. O login fica para depois, quando fizer sentido salvar historico e Pix.',
    eyebrow: 'Etapa 1',
    icon: Camera,
    title: 'Escaneie a conta',
  },
  {
    checklist: ['OCR extrai o texto', 'IA organiza itens e totais', 'Avisos mostram o que revisar'],
    description: 'Depois da foto, o Rachae transforma a comanda em um rascunho conferivel antes de dividir qualquer valor.',
    eyebrow: 'Etapa 2',
    icon: ReceiptText,
    title: 'Confira a leitura',
  },
  {
    checklist: ['Adicione quem participou', 'Marque item por item', 'Taxa e desconto entram proporcionalmente'],
    description: 'Cada item pode ter pessoas diferentes. O calculo final respeita centavos e evita divisao injusta.',
    eyebrow: 'Etapa 3',
    icon: UsersRound,
    title: 'Monte o racha',
  },
  {
    checklist: ['Veja o total por pessoa', 'Compartilhe no WhatsApp', 'Configure Pix quando quiser salvar dados'],
    description: 'No fim do procedimento, a pessoa ja tem o resumo pronto. Conta e login viram apoio, nao barreira.',
    eyebrow: 'Etapa 4',
    icon: Send,
    title: 'Envie e cobre',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigation>();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex] ?? steps[0]!;
  const Icon = step.icon;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  function handleStartScan() {
    completeOnboarding();
    navigation.replace('ReceiptCapture');
  }

  function handleAuth(route: AuthRoute) {
    completeOnboarding(route);
    navigation.replace(route);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" testID="screen-onboarding">
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View>
          <Text className="text-xs font-black uppercase tracking-[1px] text-brand-600">Fluxo guiado</Text>
          <Text className="mt-1 text-2xl font-black text-ink-900">Rachae</Text>
        </View>
        <View className="flex-row gap-2" testID="onboarding-step-indicator">
          {steps.map((item, index) => (
            <View
              key={item.title}
              className={cn('h-2.5 rounded-full', index === stepIndex ? 'w-8 bg-brand-500' : 'w-2.5 bg-ink-200')}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="onboarding-scroll">
        <View className="rounded-[28px] bg-ink-900 p-5" testID="onboarding-active-step">
          <View className="flex-row items-center justify-between">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-money-500">
              <Icon color="#0F172A" size={28} />
            </View>
            <Text className="text-sm font-black uppercase tracking-[1px] text-white/70">{step.eyebrow} de 4</Text>
          </View>

          <Text className="mt-8 text-4xl font-black leading-tight text-white">{step.title}</Text>
          <Text className="mt-4 text-base leading-7 text-white/75">{step.description}</Text>
        </View>

        <View className="mt-5 gap-3">
          {step.checklist.map((item) => (
            <Card key={item} className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-50">
                <CheckCircle2 color="#00A676" size={19} />
              </View>
              <Text className="flex-1 text-base font-bold text-ink-800">{item}</Text>
            </Card>
          ))}
        </View>

        <Card className="mt-5" variant="soft">
          <Text className="text-sm font-black uppercase tracking-[1px] text-brand-700">Ordem do procedimento</Text>
          <View className="mt-4 gap-3">
            {steps.map((item, index) => {
              const isDone = index < stepIndex;
              const isActive = index === stepIndex;

              return (
                <View key={item.title} className="flex-row items-center gap-3">
                  <View className={cn('h-8 w-8 items-center justify-center rounded-full', isActive || isDone ? 'bg-brand-500' : 'bg-white')}>
                    <Text className={cn('text-xs font-black', isActive || isDone ? 'text-white' : 'text-ink-500')}>{index + 1}</Text>
                  </View>
                  <Text className={cn('text-sm font-bold', isActive ? 'text-brand-700' : 'text-ink-600')}>{item.title}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <View className="gap-3 border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        {isLastStep ? (
          <Button size="lg" testID="onboarding-scan-start-button" title="Escanear conta" onPress={handleStartScan} />
        ) : (
          <Button size="lg" testID="onboarding-next-step-button" title="Proxima etapa" onPress={() => setStepIndex((current) => current + 1)} />
        )}

        {!isFirstStep ? (
          <Button
            leftIcon={<ChevronLeft color="#0F172A" size={18} />}
            size="lg"
            testID="onboarding-back-step-button"
            title="Voltar etapa"
            variant="ghost"
            onPress={() => setStepIndex((current) => current - 1)}
          />
        ) : null}

        <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-1 pt-1">
          <Text className="text-sm text-ink-500">Quer salvar historico?</Text>
          <Pressable accessibilityLabel="Entrar" accessibilityRole="button" testID="onboarding-auth-login-link" onPress={() => handleAuth('Login')}>
            <Text className="text-sm font-black text-brand-700">Entrar</Text>
          </Pressable>
          <Text className="text-sm text-ink-400">ou</Text>
          <Pressable accessibilityLabel="Criar conta" accessibilityRole="button" testID="onboarding-auth-register-link" onPress={() => handleAuth('Register')}>
            <Text className="text-sm font-black text-brand-700">criar conta</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
