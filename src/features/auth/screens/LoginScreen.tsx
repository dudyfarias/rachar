import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { Button, Card, Input } from '../../../components/ui';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { useAuthStore } from '../../../stores/authStore';
import type { RootStackParamList } from '../../../types/navigation';

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigation>();
  const signIn = useAuthStore((state) => state.signIn);
  const startDemoSession = useAuthStore((state) => state.startDemoSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const session = useAuthStore((state) => state.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (session) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  }, [navigation, session]);

  async function handleSignIn() {
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Nao foi possivel entrar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  function handleGuestScan() {
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'ReceiptCapture' }] });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background" testID="screen-login">
      <ScrollView contentContainerClassName="flex-grow justify-center px-5 py-8" keyboardShouldPersistTaps="handled" testID="login-scroll">
        <Text className="text-sm font-black uppercase tracking-[1px] text-brand-600">Bem-vindo de volta</Text>
        <Text className="mt-2 text-4xl font-black text-ink-900">Entre no Rachae</Text>
        <Text className="mt-3 text-base leading-6 text-ink-500">
          Acesse seus rachas, salve contas e acompanhe seu historico em qualquer dispositivo.
        </Text>

        {!isSupabaseConfigured ? (
          <Card className="mt-6" variant="soft">
            <Text className="text-sm font-bold text-brand-700">Modo demo disponivel</Text>
            <Text className="mt-1 text-sm leading-5 text-ink-600">
              Explore o fluxo principal sem criar uma conta agora.
            </Text>
          </Card>
        ) : null}

        <View className="mt-6 gap-4">
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="voce@email.com"
            testID="login-email-input"
            value={email}
          />
          <Input
            label="Senha"
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
            testID="login-password-input"
            value={password}
          />
        </View>

        <Button className="mt-6" loading={isLoading} size="lg" testID="login-submit-button" title="Entrar" onPress={handleSignIn} />
        <Button
          className="mt-3"
          size="lg"
          testID="login-demo-button"
          title="Explorar em modo demo"
          variant="secondary"
          onPress={startDemoSession}
        />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-ink-500">Ainda nao tem conta? </Text>
          <Text
            accessibilityLabel="Criar cadastro"
            accessibilityRole="button"
            className="text-sm font-black text-brand-600"
            testID="login-register-link"
            onPress={() => navigation.navigate('Register')}
          >
            Criar cadastro
          </Text>
        </View>

        <View className="mt-8 border-t border-ink-100 pt-5">
          <Text className="text-center text-sm text-ink-500">So quer testar agora?</Text>
          <Button
            className="mt-3"
            size="lg"
            testID="login-guest-scan-button"
            title="Escanear sem conta"
            variant="ghost"
            onPress={handleGuestScan}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
