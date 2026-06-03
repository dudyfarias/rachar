import { createId } from '../../lib/id';
import type { ParsedReceipt, ParsedReceiptItem, ReceiptWarning } from '../../types/receipt';

type ReceiptParserInput = {
  imageUrl?: string;
  ocrText: string;
};

type NormalizedItemInput = {
  confidence?: number;
  name?: unknown;
  price?: unknown;
  priceInCents?: unknown;
  quantity?: unknown;
  total?: unknown;
  totalInCents?: unknown;
  unitPrice?: unknown;
  unitPriceInCents?: unknown;
};

const currencyFormatterPattern = /R?\$?\s*\d+[.,]\d{2}/gi;

function parseCurrencyString(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function readCentsFromValue(value: unknown, valueIsAlreadyCents = true) {
  if (typeof value === 'string') {
    return parseCurrencyString(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(valueIsAlreadyCents ? value : value * 100));
  }

  return 0;
}

function firstValue<T extends Record<string, unknown>>(payload: T, keys: string[]) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) {
      return payload[key];
    }
  }

  return undefined;
}

function normalizeWarnings(value: unknown): ReceiptWarning[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((warning) => {
      if (!warning || typeof warning !== 'object') {
        return null;
      }

      const candidate = warning as Partial<ReceiptWarning>;

      return {
        code: String(candidate.code || 'AI_WARNING'),
        message: String(candidate.message || 'Aviso retornado pela IA.'),
        severity: candidate.severity === 'error' || candidate.severity === 'info' ? candidate.severity : 'warning',
      };
    })
    .filter(Boolean) as ReceiptWarning[];
}

function normalizeItem(item: NormalizedItemInput, index: number): ParsedReceiptItem | null {
  const name = typeof item.name === 'string' ? item.name.trim() : '';

  if (!name) {
    return null;
  }

  const quantity = Math.max(1, Number(item.quantity || 1));
  const explicitUnitInCents = firstValue(item, ['unitPriceInCents', 'unit_price_cents', 'priceInCents', 'price_cents']);
  const explicitTotalInCents = firstValue(item, ['totalInCents', 'total_cents']);
  const unitPriceInput = explicitUnitInCents ?? firstValue(item, ['unitPrice', 'unit_price', 'price']);
  const totalInput = explicitTotalInCents ?? firstValue(item, ['total']);
  const unitPriceInCents = readCentsFromValue(unitPriceInput, explicitUnitInCents !== undefined);
  const totalInCents =
    totalInput !== undefined
      ? readCentsFromValue(totalInput, explicitTotalInCents !== undefined)
      : Math.round(unitPriceInCents * quantity);

  if (totalInCents <= 0) {
    return null;
  }

  return {
    confidence: item.confidence,
    id: createId(`receipt-item-${index}`),
    name,
    quantity,
    totalInCents,
    unitPriceInCents: unitPriceInCents > 0 ? unitPriceInCents : Math.round(totalInCents / quantity),
  };
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return JSON.parse(fenced[1]);
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }

  return JSON.parse(text);
}

function validateReceipt(receipt: ParsedReceipt) {
  const warnings = [...receipt.warnings];
  const calculatedSubtotal = receipt.items.reduce((sum, item) => sum + item.totalInCents, 0);
  const calculatedTotal = calculatedSubtotal + receipt.serviceFeeInCents - receipt.discountInCents;
  const subtotalDelta = Math.abs(calculatedSubtotal - receipt.subtotalInCents);
  const totalDelta = Math.abs(calculatedTotal - receipt.totalInCents);

  if (receipt.items.length === 0) {
    warnings.push({
      code: 'NO_ITEMS',
      message: 'Nenhum item foi identificado na conta.',
      severity: 'error',
    });
  }

  if (subtotalDelta > 2) {
    warnings.push({
      code: 'SUBTOTAL_MISMATCH',
      message: 'Subtotal dos itens nao bate com o subtotal informado.',
      severity: 'warning',
    });
  }

  if (totalDelta > 2) {
    warnings.push({
      code: 'TOTAL_MISMATCH',
      message: 'Total informado nao bate com itens, taxa e desconto.',
      severity: 'warning',
    });
  }

  return {
    ...receipt,
    subtotalInCents: receipt.subtotalInCents > 0 ? receipt.subtotalInCents : calculatedSubtotal,
    totalInCents: receipt.totalInCents > 0 ? receipt.totalInCents : calculatedTotal,
    warnings,
  };
}

function normalizeReceiptPayload(payload: Record<string, unknown>, provider: string): ParsedReceipt {
  const itemsPayload = firstValue(payload, ['items', 'itens']) as NormalizedItemInput[] | undefined;
  const items = Array.isArray(itemsPayload)
    ? itemsPayload.map((item, index) => normalizeItem(item, index)).filter(Boolean)
    : [];
  const normalizedItems = items as ParsedReceiptItem[];
  const calculatedSubtotal = normalizedItems.reduce((sum, item) => sum + item.totalInCents, 0);
  const explicitServiceFee = firstValue(payload, ['serviceFeeInCents', 'service_fee_cents', 'taxaInCents', 'taxa_cents']);
  const explicitDiscount = firstValue(payload, ['discountInCents', 'discount_cents', 'descontoInCents', 'desconto_cents']);
  const explicitSubtotal = firstValue(payload, ['subtotalInCents', 'subtotal_cents']);
  const explicitTotal = firstValue(payload, ['totalInCents', 'total_cents']);
  const serviceFeeInCents = readCentsFromValue(
    explicitServiceFee ?? firstValue(payload, ['serviceFee', 'service_fee', 'taxa']),
    explicitServiceFee !== undefined,
  );
  const discountInCents = readCentsFromValue(
    explicitDiscount ?? firstValue(payload, ['discount', 'desconto']),
    explicitDiscount !== undefined,
  );
  const subtotalInCents =
    explicitSubtotal !== undefined ? readCentsFromValue(explicitSubtotal, true) : calculatedSubtotal;
  const totalInCents =
    explicitTotal !== undefined
      ? readCentsFromValue(explicitTotal, true)
      : subtotalInCents + serviceFeeInCents - discountInCents;

  return validateReceipt({
    discountInCents,
    items: normalizedItems,
    provider,
    restaurantName: String(firstValue(payload, ['restaurantName', 'restaurant_name', 'restaurante']) || '').trim() || null,
    serviceFeeInCents,
    subtotalInCents,
    totalInCents,
    warnings: normalizeWarnings(payload.warnings),
  });
}

function parseFallbackLine(line: string, index: number): ParsedReceiptItem | null {
  const moneyMatches = [...line.matchAll(currencyFormatterPattern)].map((match) => match[0]);

  if (moneyMatches.length === 0) {
    return null;
  }

  const quantityMatch = line.match(/^\s*(\d+(?:[.,]\d+)?)\s*x?/i);
  const quantity = quantityMatch?.[1] ? Math.max(1, Number(quantityMatch[1].replace(',', '.'))) : 1;
  const lastMoney = moneyMatches[moneyMatches.length - 1] ?? '0';
  const firstMoney = moneyMatches[0] ?? lastMoney;
  const totalInCents = parseCurrencyString(lastMoney);
  const firstPriceInCents = parseCurrencyString(firstMoney);
  const name = line
    .replace(/^\s*\d+(?:[.,]\d+)?\s*x?\s*/i, '')
    .replace(currencyFormatterPattern, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!name || totalInCents <= 0) {
    return null;
  }

  return {
    confidence: 0.56,
    id: createId(`receipt-item-${index}`),
    name,
    quantity,
    totalInCents,
    unitPriceInCents: moneyMatches.length > 1 ? firstPriceInCents : Math.round(totalInCents / quantity),
  };
}

function hasCurrencyValue(line: string) {
  currencyFormatterPattern.lastIndex = 0;
  return currencyFormatterPattern.test(line);
}

function parseReceiptLocally(ocrText: string): ParsedReceipt {
  const lines = ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const itemLines = lines.filter((line) => !/(subtotal|total|taxa|servi[cç]o|desconto)/i.test(line));
  const items = itemLines.map(parseFallbackLine).filter(Boolean) as ParsedReceiptItem[];
  const serviceFeeLine = lines.find((line) => /(taxa|servi[cç]o)/i.test(line));
  const discountLine = lines.find((line) => /desconto/i.test(line));
  const totalLine = [...lines].reverse().find((line) => /total/i.test(line));
  const firstContentLine = lines.find((line) => !hasCurrencyValue(line)) || null;

  return validateReceipt({
    discountInCents: discountLine ? parseCurrencyString(discountLine) : 0,
    items,
    provider: 'local-ai-fallback',
    restaurantName: firstContentLine,
    serviceFeeInCents: serviceFeeLine ? parseCurrencyString(serviceFeeLine) : 0,
    subtotalInCents: items.reduce((sum, item) => sum + item.totalInCents, 0),
    totalInCents: totalLine ? parseCurrencyString(totalLine) : 0,
    warnings: [
      {
        code: 'AI_FALLBACK',
        message: 'Parser remoto de IA nao configurado. Conferencia feita com parser local.',
        severity: 'info',
      },
    ],
  });
}

async function parseReceiptRemotely(input: ReceiptParserInput) {
  const endpoint = process.env.EXPO_PUBLIC_RECEIPT_AI_ENDPOINT;

  if (!endpoint) {
    return null;
  }

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      imageUrl: input.imageUrl,
      ocrText: input.ocrText,
      schema: {
        discountInCents: 'number',
        items: [{ name: 'string', quantity: 'number', totalInCents: 'number', unitPriceInCents: 'number' }],
        restaurantName: 'string | null',
        serviceFeeInCents: 'number',
        subtotalInCents: 'number',
        totalInCents: 'number',
        warnings: [{ code: 'string', message: 'string', severity: 'info | warning | error' }],
      },
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Parser de IA falhou com status ${response.status}.`);
  }

  const text = await response.text();
  const payload = extractJsonObject(text) as Record<string, unknown>;
  const receiptPayload = (payload.receipt || payload.data || payload) as Record<string, unknown>;

  return normalizeReceiptPayload(receiptPayload, String(payload.provider || 'remote-ai'));
}

export async function parseReceiptWithAi(input: ReceiptParserInput) {
  const remoteReceipt = await parseReceiptRemotely(input);

  if (remoteReceipt) {
    return remoteReceipt;
  }

  return parseReceiptLocally(input.ocrText);
}
