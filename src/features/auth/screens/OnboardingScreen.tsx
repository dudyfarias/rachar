import { LinearGradient } from 'expo-linear-gradient';
import { ReceiptText, ShieldCheck, Sparkles } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '../../../components/ui';
import { useAppStore } from '../../../stores/appStore';

const highlights = [
  {
    icon: ReceiptText,
    title: 'Racha manual rapido',
    description: 'Cadastre pessoas, itens, taxa e desconto em poucos toques.',
  },
  {
    icon: ShieldCheck,
    title: 'Base segura',
    description: 'Sessao protegida, dados por usuario e modo demo para testar sem configurar servidor.',
  },
  {
    icon: Sparkles,
    title: 'Pronto para IA',
    description: 'OCR e revisao assistida ajudam a transformar a comanda em rascunho conferivel.',
  },
];

export function OnboardingScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return (
    <SafeAreaView className="flex-1 bg-background" testID="screen-onboarding">
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="onboarding-scroll">
        <LinearGradient
          colors={['#00A676', '#047857']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{ borderRadius: 28, marginTop: 16, padding: 24 }}
        >
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Text className="text-3xl font-black text-white">R</Text>
          </View>
          <Text className="mt-8 text-4xl font-black leading-tight text-white">Rachaê</Text>
          <Text className="mt-3 text-lg font-semibold leading-7 text-white/90">
            Divida contas com precisao, sem planilha, sem constrangimento e com cara de banco digital.
          </Text>
          <View className="mt-8 rounded-2xl bg-white/15 p-4">
            <Text className="text-sm font-bold uppercase tracking-[1px] text-white/80">Do pedido ao Pix</Text>
            <Text className="mt-1 text-2xl font-black text-white">Fluxo guiado de divisao</Text>
          </View>
        </LinearGradient>

        <View className="mt-5 gap-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                  <Icon color="#00A676" size={23} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-ink-900">{item.title}</Text>
                  <Text className="mt-1 text-sm leading-5 text-ink-500">{item.description}</Text>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        <Button size="lg" testID="onboarding-login-button" title="Entrar" onPress={() => completeOnboarding('Login')} />
        <Button
          size="lg"
          testID="onboarding-register-button"
          title="Criar conta"
          variant="secondary"
          onPress={() => completeOnboarding('Register')}
        />
      </View>
    </SafeAreaView>
  );
}
