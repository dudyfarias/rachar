type ReceiptLayout = {
  name: string;
  headerPattern: RegExp;
  itemPattern: RegExp;
  totalPattern: RegExp;
  serviceFeePattern: RegExp;
  discountPattern: RegExp;
  quantityPosition: 'before-name' | 'after-name' | 'none';
};

const layouts: ReceiptLayout[] = [
  {
    name: 'standard-br',
    headerPattern: /^[A-Z\s]{3,}$/m,
    itemPattern: /^(\d+)\s*x?\s+(.+?)\s+([\d.,]+)\s+([\d.,]+)$/gm,
    totalPattern: /total\s*:?\s*(R?\$?\s*[\d.,]+)/i,
    serviceFeePattern: /(taxa|servi[cç]o)\s*:?\s*(R?\$?\s*[\d.,]+)/i,
    discountPattern: /desconto\s*:?\s*(R?\$?\s*[\d.,]+)/i,
    quantityPosition: 'before-name',
  },
  {
    name: 'compact-br',
    headerPattern: /^[\w\s]+(?:bar|restaurante|lanchonete|padaria|pizza)/im,
    itemPattern: /^(.+?)\s+([\d.,]+)$/gm,
    totalPattern: /total\s*:?\s*([\d.,]+)/i,
    serviceFeePattern: /(taxa|servi[cç]o)\s*:?\s*([\d.,]+)/i,
    discountPattern: /desconto\s*:?\s*([\d.,]+)/i,
    quantityPosition: 'none',
  },
  {
    name: 'nfc-e',
    headerPattern: /nota\s*fiscal|nfc-?e|cupom\s*fiscal/i,
    itemPattern: /(\d{3})\s+(.+?)\s+(\d+)\s+(?:UN|KG|LT)\s+([\d.,]+)\s+([\d.,]+)/gm,
    totalPattern: /valor\s*total\s*:?\s*([\d.,]+)/i,
    serviceFeePattern: /(taxa|gorjeta)\s*:?\s*([\d.,]+)/i,
    discountPattern: /(desconto|desc)\s*:?\s*([\d.,]+)/i,
    quantityPosition: 'after-name',
  },
];

export type PatternMatch = {
  layoutName: string;
  confidence: number;
  quantityPosition: 'before-name' | 'after-name' | 'none';
};

export function detectLayout(ocrText: string): PatternMatch | null {
  let bestMatch: PatternMatch | null = null;
  let bestScore = 0;

  for (const layout of layouts) {
    let score = 0;

    if (layout.headerPattern.test(ocrText)) score += 2;
    if (layout.totalPattern.test(ocrText)) score += 3;
    if (layout.serviceFeePattern.test(ocrText)) score += 1;

    layout.itemPattern.lastIndex = 0;
    const itemMatches = ocrText.match(layout.itemPattern);
    if (itemMatches && itemMatches.length > 0) {
      score += Math.min(itemMatches.length, 5);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        layoutName: layout.name,
        confidence: Math.min(0.95, score / 12),
        quantityPosition: layout.quantityPosition,
      };
    }
  }

  return bestMatch;
}

export function extractRestaurantName(ocrText: string): string | null {
  const lines = ocrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines.slice(0, 3)) {
    const cleaned = line.replace(/[^\p{L}\p{N}\s.\-&']/gu, '').trim();
    if (cleaned.length >= 3 && !/^\d+$/.test(cleaned) && !/total|subtotal|taxa|desconto/i.test(cleaned)) {
      return cleaned;
    }
  }

  return null;
}

export function normalizeReceiptText(ocrText: string): string {
  return ocrText
    .replace(/\t/g, ' ')
    .replace(/[ ]{3,}/g, '  ')
    .replace(/(\d),(\d{2})(?!\d)/g, '$1.$2')
    .replace(/R\s*\$/g, 'R$')
    .trim();
}
