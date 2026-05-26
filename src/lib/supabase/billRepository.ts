import { supabase } from './client';
import type { BillDraft, SplitSummary } from '../../types/billing';

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

  const peopleInserts = result.people.map((person) => ({
    bill_id: billId,
    name: person.name,
  }));

  const { data: savedPeople, error: peopleError } = await supabase
    .from('bill_people')
    .insert(peopleInserts)
    .select('id, name');

  if (peopleError || !savedPeople) {
    throw new Error(`Erro ao salvar participantes: ${peopleError?.message ?? 'resposta vazia'}`);
  }

  const personIdMap = new Map(savedPeople.map((p) => [p.name, p.id]));

  const uniqueItems = new Map<string, { name: string; priceInCents: number }>();
  for (const person of result.people) {
    for (const item of person.items) {
      if (!uniqueItems.has(item.itemId)) {
        uniqueItems.set(item.itemId, { name: item.itemName, priceInCents: item.amountInCents });
      } else {
        const existing = uniqueItems.get(item.itemId)!;
        existing.priceInCents += item.amountInCents;
      }
    }
  }

  const itemInserts = [...uniqueItems.values()].map((item) => ({
    bill_id: billId,
    name: item.name,
    price_cents: item.priceInCents,
  }));

  const { data: savedItems, error: itemsError } = await supabase
    .from('bill_items')
    .insert(itemInserts)
    .select('id, name');

  if (itemsError || !savedItems) {
    throw new Error(`Erro ao salvar itens: ${itemsError?.message ?? 'resposta vazia'}`);
  }

  const itemIdMap = new Map(savedItems.map((i) => [i.name, i.id]));

  const splitInserts: Array<{ bill_item_id: string; bill_person_id: string; amount_cents: number }> = [];
  for (const person of result.people) {
    const dbPersonId = personIdMap.get(person.name);
    if (!dbPersonId) continue;
    for (const item of person.items) {
      const dbItemId = itemIdMap.get(item.itemName);
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

export async function listBills(ownerId: string) {
  const { data, error } = await supabase
    .from('bills')
    .select('id, title, place, total_cents, status, created_at')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Erro ao listar contas: ${error.message}`);
  }

  return data ?? [];
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
    supabase.from('bill_people').select('*').eq('bill_id', billId),
    supabase.from('bill_items').select('*').eq('bill_id', billId),
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
  const { data: bill, error } = await supabase
    .from('bills')
    .select('*')
    .eq('share_token', token)
    .single();

  if (error || !bill) {
    return null;
  }

  const [peopleResult, itemsResult] = await Promise.all([
    supabase.from('bill_people').select('*').eq('bill_id', bill.id),
    supabase.from('bill_items').select('*').eq('bill_id', bill.id),
  ]);

  const people = peopleResult.data ?? [];
  const items = itemsResult.data ?? [];

  const itemIds = items.map((i) => i.id);
  const { data: splits } = itemIds.length > 0
    ? await supabase.from('item_splits').select('*').in('bill_item_id', itemIds)
    : { data: [] };

  return { bill, people, items, splits: splits ?? [] };
}
