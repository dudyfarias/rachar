import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';

import { Button, Input } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import type { RootStackParamList } from '../../../types/navigation';

type RegisterNavigation = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigation>();
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignUp() {
    try {
      await signUp({ email: email.trim(), fullName: fullName.trim(), password });
      Alert.alert('Cadastro criado', 'Se a confirmacao de email estiver ativa, confirme sua conta antes de entrar.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Nao foi possivel cadastrar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow justify-center px-5 py-8" keyboardShouldPersistTaps="handled">
        <Text className="text-sm font-black uppercase tracking-[1px] text-brand-600">Nova conta</Text>
        <Text className="mt-2 text-4xl font-black text-ink-900">Crie seu acesso</Text>
        <Text className="mt-3 text-base leading-6 text-ink-500">
          O cadastro usa Supabase Auth e prepara um perfil publico para os proximos sprints.
        </Text>

        <View className="mt-6 gap-4">
          <Input label="Nome" onChangeText={setFullName} placeholder="Seu nome" value={fullName} />
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="voce@email.com"
            value={email}
          />
          <Input
            helper="Use pelo menos 6 caracteres."
            label="Senha"
            onChangeText={setPassword}
            placeholder="Crie uma senha"
            secureTextEntry
            value={password}
          />
        </View>

        <Button className="mt-6" loading={isLoading} size="lg" title="Cadastrar" onPress={handleSignUp} />
        <Button className="mt-3" size="lg" title="Voltar para login" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
