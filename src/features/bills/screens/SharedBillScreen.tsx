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
  people: Array<{ id: string; name: string; totalCents: number }>;
  items: Array<{ name: string; priceCents: number }>;
};

function allocateProportionally(
  totalCents: number,
  people: Array<{ id: string }>,
  weightsByPersonId: Map<string, number>,
) {
  const emptyAllocations = new Map(people.map((person) => [person.id, 0]));

  if (totalCents <= 0 || people.length === 0) {
    return emptyAllocations;
  }

  const totalWeight = people.reduce((sum, person) => sum + (weightsByPersonId.get(person.id) ?? 0), 0);

  if (totalWeight <= 0) {
    return emptyAllocations;
  }

  const allocations = new Map<string, number>();
  const remainders: Array<{ id: string; index: number; remainder: number }> = [];
  let allocated = 0;

  people.forEach((person, index) => {
    const weight = weightsByPersonId.get(person.id) ?? 0;
    const numerator = BigInt(totalCents) * BigInt(weight);
    const denominator = BigInt(totalWeight);
    const base = Number(numerator / denominator);
    const remainder = Number(numerator % denominator);

    allocations.set(person.id, base);
    allocated += base;
    remainders.push({ id: person.id, index, remainder });
  });

  let centsToDistribute = totalCents - allocated;
  remainders.sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (const target of remainders) {
    if (centsToDistribute <= 0) {
      break;
    }

    allocations.set(target.id, (allocations.get(target.id) ?? 0) + 1);
    centsToDistribute -= 1;
  }

  return allocations;
}

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

        const itemSubtotalsByPerson = new Map<string, number>();
        for (const split of result.splits) {
          const personId = split.bill_person_id;
          itemSubtotalsByPerson.set(personId, (itemSubtotalsByPerson.get(personId) ?? 0) + split.amount_cents);
        }
        const serviceFeeByPerson = allocateProportionally(
          result.bill.service_fee_cents,
          result.people,
          itemSubtotalsByPerson,
        );
        const discountByPerson = allocateProportionally(
          result.bill.discount_cents,
          result.people,
          itemSubtotalsByPerson,
        );

        setData({
          title: result.bill.title,
          place: result.bill.place,
          totalCents: result.bill.total_cents,
          serviceFeeCents: result.bill.service_fee_cents,
          discountCents: result.bill.discount_cents,
          people: result.people.map((p) => ({
            id: p.id,
            name: p.name,
            totalCents:
              (itemSubtotalsByPerson.get(p.id) ?? 0) +
              (serviceFeeByPerson.get(p.id) ?? 0) -
              (discountByPerson.get(p.id) ?? 0),
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
      <View className="flex-1 items-center justify-center bg-background" testID="screen-shared-bill-loading">
        <ActivityIndicator color="#00A676" size="large" />
        <Text className="mt-3 text-sm text-ink-500">Carregando conta...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8" testID="screen-shared-bill-error">
        <Text className="text-center text-lg font-bold text-danger-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" testID="screen-shared-bill">
      <Header title={data.title || 'Racha compartilhado'} eyebrow={data.place ?? 'Conta compartilhada'} testID="shared-bill-header" />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false} testID="shared-bill-scroll">
        <Card variant="dark">
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
          <Card key={person.id} className="mt-2" testID={`shared-bill-person-${person.id}`}>
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
          <Card key={`${item.name}-${index}`} className="mt-2" testID={`shared-bill-item-${index}`}>
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
