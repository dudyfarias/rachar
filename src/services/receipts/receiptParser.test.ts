import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseReceiptWithAi } from './receiptParser';

describe('parseReceiptWithAi', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_RECEIPT_AI_ENDPOINT;
    vi.unstubAllGlobals();
  });

  it('usa parser local quando endpoint remoto nao esta configurado', async () => {
    const receipt = await parseReceiptWithAi({
      ocrText: `Restaurante Rachae
2x Hamburguer Artesanal 38,00 76,00
1x Refrigerante 8,00
1x Sobremesa 18,00
Taxa de servico 10,20
Desconto 5,00
Total 107,20`,
    });

    expect(receipt.provider).toBe('local-ai-fallback');
    expect(receipt.restaurantName).toBe('Restaurante Rachae');
    expect(receipt.subtotalInCents).toBe(10200);
    expect(receipt.serviceFeeInCents).toBe(1020);
    expect(receipt.discountInCents).toBe(500);
    expect(receipt.totalInCents).toBe(10720);
    expect(receipt.items).toMatchObject([
      {
        name: 'Hamburguer Artesanal',
        quantity: 2,
        totalInCents: 7600,
        unitPriceInCents: 3800,
      },
      {
        name: 'Refrigerante',
        quantity: 1,
        totalInCents: 800,
        unitPriceInCents: 800,
      },
      {
        name: 'Sobremesa',
        quantity: 1,
        totalInCents: 1800,
        unitPriceInCents: 1800,
      },
    ]);
    expect(receipt.warnings).toContainEqual(
      expect.objectContaining({
        code: 'AI_FALLBACK',
        severity: 'info',
      }),
    );
  });

  it('normaliza resposta remota embrulhada em JSON markdown', async () => {
    process.env.EXPO_PUBLIC_RECEIPT_AI_ENDPOINT = 'https://parser.example.test';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () =>
          '```json\n' +
          JSON.stringify({
            provider: 'remote-test',
            receipt: {
              desconto: 'R$ 1,00',
              items: [
                {
                  name: 'Cafe especial',
                  quantity: 2,
                  total: 'R$ 25,00',
                  unitPrice: 'R$ 12,50',
                },
              ],
              restaurant_name: 'Padaria Central',
              service_fee: 'R$ 2,50',
              total_cents: 2650,
            },
          }) +
          '\n```',
      })),
    );

    const receipt = await parseReceiptWithAi({ imageUrl: 'https://image.test/receipt.jpg', ocrText: 'texto OCR' });

    expect(receipt.provider).toBe('remote-test');
    expect(receipt.restaurantName).toBe('Padaria Central');
    expect(receipt.serviceFeeInCents).toBe(250);
    expect(receipt.discountInCents).toBe(100);
    expect(receipt.totalInCents).toBe(2650);
    expect(receipt.items[0]).toMatchObject({
      name: 'Cafe especial',
      quantity: 2,
      totalInCents: 2500,
      unitPriceInCents: 1250,
    });
  });

  it('adiciona warning quando total informado diverge do calculado', async () => {
    const receipt = await parseReceiptWithAi({
      ocrText: `Padaria Central
Cafe 5,00
Total 9,99`,
    });

    expect(receipt.warnings).toContainEqual(
      expect.objectContaining({
        code: 'TOTAL_MISMATCH',
        severity: 'warning',
      }),
    );
  });
});
