import { describe, expect, it } from 'vitest';

import { calculateSplits } from './calculateSplits';
import type { BillDraft } from '../../types/billing';

const people = [
  { id: 'ana', name: 'Ana' },
  { id: 'bia', name: 'Bia' },
  { id: 'caio', name: 'Caio' },
];

function createDraft(overrides: Partial<BillDraft>): BillDraft {
  return {
    discountInCents: 0,
    items: [],
    people,
    place: 'Restaurante Teste',
    serviceFeeInCents: 0,
    title: 'Racha teste',
    ...overrides,
  };
}

describe('calculateSplits', () => {
  it('divide itens com arredondamento deterministico em centavos', () => {
    const result = calculateSplits(
      createDraft({
        items: [
          {
            id: 'item-batata',
            name: 'Batata',
            participantIds: ['ana', 'bia', 'caio'],
            priceInCents: 1000,
          },
        ],
      }),
    );

    expect(result.totalInCents).toBe(1000);
    expect(result.people.map((person) => person.totalInCents)).toEqual([334, 333, 333]);
  });

  it('distribui taxa e desconto proporcionalmente ao subtotal de cada pessoa', () => {
    const result = calculateSplits(
      createDraft({
        discountInCents: 800,
        items: [
          {
            id: 'item-suco',
            name: 'Suco',
            participantIds: ['ana'],
            priceInCents: 1000,
          },
          {
            id: 'item-prato',
            name: 'Prato',
            participantIds: ['bia'],
            priceInCents: 3000,
          },
        ],
        people: people.slice(0, 2),
        serviceFeeInCents: 400,
      }),
    );

    expect(result.subtotalInCents).toBe(4000);
    expect(result.totalInCents).toBe(3600);
    expect(result.people).toMatchObject([
      {
        discountInCents: 200,
        itemSubtotalInCents: 1000,
        serviceFeeInCents: 100,
        totalInCents: 900,
      },
      {
        discountInCents: 600,
        itemSubtotalInCents: 3000,
        serviceFeeInCents: 300,
        totalInCents: 2700,
      },
    ]);
  });

  it('limita desconto ao subtotal para evitar total negativo', () => {
    const result = calculateSplits(
      createDraft({
        discountInCents: 2000,
        items: [
          {
            id: 'item-cafe',
            name: 'Cafe',
            participantIds: ['ana'],
            priceInCents: 1000,
          },
        ],
        people: people.slice(0, 1),
      }),
    );

    expect(result.discountInCents).toBe(1000);
    expect(result.totalInCents).toBe(0);
    expect(result.people[0]?.totalInCents).toBe(0);
  });

  it('rejeita rachas sem participantes ou com participantes invalidos', () => {
    expect(() =>
      calculateSplits(
        createDraft({
          items: [],
          people: [],
        }),
      ),
    ).toThrow('Adicione pelo menos uma pessoa ao racha.');

    expect(() =>
      calculateSplits(
        createDraft({
          items: [
            {
              id: 'item-invalido',
              name: 'Item invalido',
              participantIds: ['pessoa-inexistente'],
              priceInCents: 1000,
            },
          ],
        }),
      ),
    ).toThrow('possui uma pessoa invalida');
  });
});
