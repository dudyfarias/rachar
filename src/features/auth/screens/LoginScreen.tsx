import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Button, Card, Input } from '../../../components/ui';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { useAuthStore } from '../../../stores/authStore';
import type { RootStackParamList } from '../../../types/navigation';
import { useState } from 'react';

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigation>();
  const signIn = useAuthStore((state) => state.signIn);
  const startDemoSession = useAuthStore((state) => state.startDemoSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignIn() {
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Nao foi possivel entrar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background" testID="screen-login">
      <ScrollView contentContainerClassName="flex-grow justify-center px-5 py-8" keyboardShouldPersistTaps="handled" testID="login-scroll">
        <Text className="text-sm font-black uppercase tracking-[1px] text-brand-600">Bem-vindo de volta</Text>
        <Text className="mt-2 text-4xl font-black text-ink-900">Entre no Rachaê</Text>
        <Text className="mt-3 text-base leading-6 text-ink-500">
          Acesse seus rachas, salve contas e acompanhe o historico quando o Supabase estiver configurado.
        </Text>

        {!isSupabaseConfigured ? (
          <Card className="mt-6 border-brand-100 bg-brand-50">
            <Text className="text-sm font-bold text-brand-700">Ambiente local sem Supabase</Text>
            <Text className="mt-1 text-sm leading-5 text-ink-600">
              Configure o arquivo .env ou use o modo demo para revisar o fluxo principal sem criar conta.
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
