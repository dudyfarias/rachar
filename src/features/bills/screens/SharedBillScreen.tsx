import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Card, Header } from '../../../components/ui';
import { formatCurrency } from '../../../lib/formatCurrency';
import * as billRepo from '../../../lib/supabase/billRepository';
import type { RootStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SharedBill'>;

type SharedBillData = {
  title: string;
  place: string | null;
  totalCents: number;
  serviceFeeCents: number;
  discountCents: number;
  people: Array<{ name: string; totalCents: number }>;
  items: Array<{ name: string; priceCents: number }>;
};

export function SharedBillScreen({ route }: Props) {
  const { token } = route.params;
  const [data, setData] = useState<SharedBillData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await billRepo.getBillByShareToken(token);
        if (!result) {
          setError('Link invalido ou expirado.');
          return;
        }

        const splitsByPerson = new Map<string, number>();
        for (const split of result.splits) {
          const personId = split.bill_person_id;
          splitsByPerson.set(personId, (splitsByPerson.get(personId) ?? 0) + split.amount_cents);
        }

        setData({
          title: result.bill.title,
          place: result.bill.place,
          totalCents: result.bill.total_cents,
          serviceFeeCents: result.bill.service_fee_cents,
          discountCents: result.bill.discount_cents,
          people: result.people.map((p) => ({
            name: p.name,
            totalCents: splitsByPerson.get(p.id) ?? 0,
          })),
          items: result.items.map((i) => ({
            name: i.name,
            priceCents: i.price_cents,
          })),
        });
      } catch {
        setError('Nao foi possivel carregar a conta compartilhada.');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#00A676" size="large" />
        <Text className="mt-3 text-sm text-ink-500">Carregando conta...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-lg font-bold text-danger-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header title={data.title || 'Racha compartilhado'} eyebrow={data.place ?? 'Conta compartilhada'} />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Card className="bg-ink-900">
          <Text className="text-sm font-bold text-white/70">Total da conta</Text>
          <Text className="mt-2 text-4xl font-black text-white">{formatCurrency(data.totalCents)}</Text>
          <View className="mt-4 flex-row justify-between">
            <Text className="text-sm text-white/60">Taxa de servico</Text>
            <Text className="text-sm font-bold text-white/80">{formatCurrency(data.serviceFeeCents)}</Text>
          </View>
          {data.discountCents > 0 ? (
            <View className="mt-2 flex-row justify-between">
              <Text className="text-sm text-white/60">Desconto</Text>
              <Text className="text-sm font-bold text-money-500">-{formatCurrency(data.discountCents)}</Text>
            </View>
          ) : null}
        </Card>

        <Text className="mt-6 mb-3 text-sm font-bold uppercase tracking-[1px] text-brand-600">
          Quanto cada pessoa paga
        </Text>
        {data.people.map((person) => (
          <Card key={person.name} className="mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-ink-900">{person.name}</Text>
              <Text className="text-base font-black text-brand-600">{formatCurrency(person.totalCents)}</Text>
            </View>
          </Card>
        ))}

        <Text className="mt-6 mb-3 text-sm font-bold uppercase tracking-[1px] text-brand-600">
          Itens da conta
        </Text>
        {data.items.map((item, index) => (
          <Card key={`${item.name}-${index}`} className="mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-ink-700">{item.name}</Text>
              <Text className="text-sm font-bold text-ink-900">{formatCurrency(item.priceCents)}</Text>
            </View>
          </Card>
        ))}

        <Text className="mt-8 text-center text-xs text-ink-400">Gerado no Rachae</Text>
      </ScrollView>
    </View>
  );
}
