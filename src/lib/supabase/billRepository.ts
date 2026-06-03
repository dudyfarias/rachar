import { supabase } from './client';
import type { BillDraft, SplitSummary } from '../../types/billing';

export type BillListItem = {
  created_at: string;
  id: string;
  people_count: number;
  place: string | null;
  status: 'draft' | 'closed';
  title: string;
  total_cents: number;
};

export async function createBill(ownerId: string, draft: BillDraft, result: SplitSummary) {
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert({
      owner_id: ownerId,
      title: draft.title || 'Racha',
      place: draft.place || null,
      subtotal_cents: result.subtotalInCents,
      service_fee_cents: result.serviceFeeInCents,
      discount_cents: result.discountInCents,
      total_cents: result.totalInCents,
      status: 'closed' as const,
    })
    .select('id')
    .single();

  if (billError || !bill) {
    throw new Error(`Erro ao salvar conta: ${billError?.message ?? 'resposta vazia'}`);
  }

  const billId = bill.id;
  const personIdMap = new Map<string, string>();
  const itemIdMap = new Map<string, string>();

  for (const person of result.people) {
    const { data: savedPerson, error: personError } = await supabase
      .from('bill_people')
      .insert({
        bill_id: billId,
        name: person.name,
      })
      .select('id')
      .single();

    if (personError || !savedPerson) {
      throw new Error(`Erro ao salvar participante "${person.name}": ${personError?.message ?? 'resposta vazia'}`);
    }

    personIdMap.set(person.personId, savedPerson.id);
  }

  const resultItemsById = new Map<string, { name: string; priceInCents: number }>();
  for (const person of result.people) {
    for (const item of person.items) {
      const existing = resultItemsById.get(item.itemId);
      resultItemsById.set(item.itemId, {
        name: existing?.name ?? item.itemName,
        priceInCents: (existing?.priceInCents ?? 0) + item.amountInCents,
      });
    }
  }

  const draftItemsById = new Map(draft.items.map((item) => [item.id, item]));

  for (const [itemId, resultItem] of resultItemsById) {
    const draftItem = draftItemsById.get(itemId);
    const { data: savedItem, error: itemError } = await supabase
      .from('bill_items')
      .insert({
        bill_id: billId,
        name: draftItem?.name ?? resultItem.name,
        price_cents: draftItem?.priceInCents ?? resultItem.priceInCents,
      })
      .select('id')
      .single();

    if (itemError || !savedItem) {
      throw new Error(`Erro ao salvar item "${resultItem.name}": ${itemError?.message ?? 'resposta vazia'}`);
    }

    itemIdMap.set(itemId, savedItem.id);
  }

  const splitInserts: Array<{ bill_item_id: string; bill_person_id: string; amount_cents: number }> = [];
  for (const person of result.people) {
    const dbPersonId = personIdMap.get(person.personId);
    if (!dbPersonId) continue;
    for (const item of person.items) {
      const dbItemId = itemIdMap.get(item.itemId);
      if (!dbItemId) continue;
      splitInserts.push({
        bill_item_id: dbItemId,
        bill_person_id: dbPersonId,
        amount_cents: item.amountInCents,
      });
    }
  }

  if (splitInserts.length > 0) {
    const { error: splitsError } = await supabase.from('item_splits').insert(splitInserts);
    if (splitsError) {
      throw new Error(`Erro ao salvar divisoes: ${splitsError.message}`);
    }
  }

  return billId;
}

export async function listBills(ownerId: string): Promise<BillListItem[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('id, title, place, total_cents, status, created_at')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Erro ao listar contas: ${error.message}`);
  }

  const bills = data ?? [];
  const billIds = bills.map((bill) => bill.id);

  if (billIds.length === 0) {
    return [];
  }

  const { data: people, error: peopleError } = await supabase
    .from('bill_people')
    .select('bill_id')
    .in('bill_id', billIds);

  if (peopleError) {
    throw new Error(`Erro ao contar participantes: ${peopleError.message}`);
  }

  const peopleCountByBillId = new Map<string, number>();
  for (const person of people ?? []) {
    peopleCountByBillId.set(person.bill_id, (peopleCountByBillId.get(person.bill_id) ?? 0) + 1);
  }

  return bills.map((bill): BillListItem => ({
    ...bill,
    people_count: peopleCountByBillId.get(bill.id) ?? 0,
  }));
}

export async function getBillById(billId: string) {
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*')
    .eq('id', billId)
    .single();

  if (billError || !bill) {
    throw new Error(`Erro ao buscar conta: ${billError?.message ?? 'nao encontrada'}`);
  }

  const [peopleResult, itemsResult] = await Promise.all([
    supabase.from('bill_people').select('*').eq('bill_id', billId).order('created_at', { ascending: true }),
    supabase.from('bill_items').select('*').eq('bill_id', billId).order('created_at', { ascending: true }),
  ]);

  const people = peopleResult.data ?? [];
  const items = itemsResult.data ?? [];

  const itemIds = items.map((i) => i.id);
  const { data: splits } = itemIds.length > 0
    ? await supabase.from('item_splits').select('*').in('bill_item_id', itemIds)
    : { data: [] };

  return { bill, people, items, splits: splits ?? [] };
}

export async function generateShareToken(billId: string) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const { error } = await supabase
    .from('bills')
    .update({ share_token: token })
    .eq('id', billId);

  if (error) {
    throw new Error(`Erro ao gerar link de compartilhamento: ${error.message}`);
  }

  return token;
}

export async function getBillByShareToken(token: string) {
  const billQuery = supabase
    .from('bills')
    .select('*')
    .eq('share_token', token)
    .single();
  billQuery.setHeader('x-share-token', token);

  const { data: bill, error } = await billQuery;

  if (error || !bill) {
    return null;
  }

  const peopleQuery = supabase
    .from('bill_people')
    .select('*')
    .eq('bill_id', bill.id)
    .order('created_at', { ascending: true });
  const itemsQuery = supabase
    .from('bill_items')
    .select('*')
    .eq('bill_id', bill.id)
    .order('created_at', { ascending: true });
  peopleQuery.setHeader('x-share-token', token);
  itemsQuery.setHeader('x-share-token', token);

  const [peopleResult, itemsResult] = await Promise.all([peopleQuery, itemsQuery]);

  const people = peopleResult.data ?? [];
  const items = itemsResult.data ?? [];

  const itemIds = items.map((i) => i.id);
  const splitsQuery = itemIds.length > 0
    ? supabase.from('item_splits').select('*').in('bill_item_id', itemIds)
    : null;

  if (splitsQuery) {
    splitsQuery.setHeader('x-share-token', token);
  }

  const { data: splits } = splitsQuery ? await splitsQuery : { data: [] };

  return { bill, people, items, splits: splits ?? [] };
}
