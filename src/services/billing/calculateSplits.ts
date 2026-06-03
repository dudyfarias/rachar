import type { BillDraft, BillItem, BillPerson, SplitSummary } from '../../types/billing';

function normalizeCents(value: number) {
  return Math.max(0, Math.round(value));
}

function splitEvenly(totalInCents: number, ids: string[]) {
  if (ids.length === 0) {
    throw new Error('Nao ha participantes para dividir o valor.');
  }

  const base = Math.floor(totalInCents / ids.length);
  const remainder = totalInCents - base * ids.length;

  return new Map(ids.map((id, index) => [id, base + (index < remainder ? 1 : 0)]));
}

function allocateProportionally(totalInCents: number, ids: string[], weights: Map<string, number>) {
  if (ids.length === 0 || totalInCents === 0) {
    return new Map(ids.map((id) => [id, 0]));
  }

  const totalWeight = ids.reduce((sum, id) => sum + normalizeCents(weights.get(id) ?? 0), 0);

  if (totalWeight === 0) {
    return splitEvenly(totalInCents, ids);
  }

  const allocations = new Map<string, number>();
  const remainders: Array<{ id: string; index: number; remainder: number }> = [];
  let allocated = 0;

  ids.forEach((id, index) => {
    const weight = normalizeCents(weights.get(id) ?? 0);
    const numerator = BigInt(totalInCents) * BigInt(weight);
    const denominator = BigInt(totalWeight);
    const base = Number(numerator / denominator);
    const remainder = Number(numerator % denominator);

    allocations.set(id, base);
    allocated += base;
    remainders.push({ id, index, remainder });
  });

  let centsToDistribute = totalInCents - allocated;
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

function validateInput(people: BillPerson[], items: BillItem[]) {
  if (people.length === 0) {
    throw new Error('Adicione pelo menos uma pessoa ao racha.');
  }

  const personIds = new Set(people.map((person) => person.id));

  items.forEach((item) => {
    if (item.priceInCents <= 0) {
      throw new Error(`O item "${item.name}" precisa ter valor maior que zero.`);
    }

    if (item.participantIds.length === 0) {
      throw new Error(`O item "${item.name}" precisa ter pelo menos uma pessoa.`);
    }

    const hasUnknownParticipant = item.participantIds.some((personId) => !personIds.has(personId));

    if (hasUnknownParticipant) {
      throw new Error(`O item "${item.name}" possui uma pessoa invalida.`);
    }
  });
}

export function calculateSplits(input: BillDraft): SplitSummary {
  const people = input.people;
  const items = input.items;

  validateInput(people, items);

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const personIds = people.map((person) => person.id);
  const itemSubtotals = new Map(personIds.map((id) => [id, 0]));
  const itemContributions = new Map(personIds.map((id) => [id, [] as SplitSummary['people'][number]['items']]));

  items.forEach((item) => {
    const priceInCents = normalizeCents(item.priceInCents);
    const participantIds = item.participantIds.filter((id) => peopleById.has(id));
    const allocations = splitEvenly(priceInCents, participantIds);

    participantIds.forEach((personId) => {
      const amountInCents = allocations.get(personId) ?? 0;
      const existingSubtotal = itemSubtotals.get(personId) ?? 0;
      const existingItems = itemContributions.get(personId) ?? [];

      itemSubtotals.set(personId, existingSubtotal + amountInCents);
      itemContributions.set(personId, [
        ...existingItems,
        {
          itemId: item.id,
          itemName: item.name,
          amountInCents,
        },
      ]);
    });
  });

  const subtotalInCents = [...itemSubtotals.values()].reduce((sum, value) => sum + value, 0);
  const serviceFeeInCents = normalizeCents(input.serviceFeeInCents);
  const discountInCents = Math.min(normalizeCents(input.discountInCents), subtotalInCents);
  const serviceFeeAllocations = allocateProportionally(serviceFeeInCents, personIds, itemSubtotals);
  const discountAllocations = allocateProportionally(discountInCents, personIds, itemSubtotals);

  const splitPeople = people.map((person) => {
    const itemSubtotalInCents = itemSubtotals.get(person.id) ?? 0;
    const personServiceFeeInCents = serviceFeeAllocations.get(person.id) ?? 0;
    const personDiscountInCents = discountAllocations.get(person.id) ?? 0;

    return {
      personId: person.id,
      name: person.name,
      itemSubtotalInCents,
      serviceFeeInCents: personServiceFeeInCents,
      discountInCents: personDiscountInCents,
      totalInCents: itemSubtotalInCents + personServiceFeeInCents - personDiscountInCents,
      items: itemContributions.get(person.id) ?? [],
    };
  });

  return {
    subtotalInCents,
    serviceFeeInCents,
    discountInCents,
    totalInCents: subtotalInCents + serviceFeeInCents - discountInCents,
    people: splitPeople,
  };
}
