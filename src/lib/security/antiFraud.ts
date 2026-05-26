import { logger } from '../logger';
import { tryConsume } from '../rateLimiter';

const MAX_BILL_TOTAL_CENTS = 500_000_00; // R$ 500.000
const MAX_ITEMS_PER_BILL = 200;
const MAX_PEOPLE_PER_BILL = 50;
const MAX_ITEM_PRICE_CENTS = 100_000_00; // R$ 100.000

type FraudCheckResult = {
  passed: boolean;
  reason?: string;
};

export function checkBillLimits(bill: {
  totalInCents: number;
  itemCount: number;
  peopleCount: number;
}): FraudCheckResult {
  if (bill.totalInCents > MAX_BILL_TOTAL_CENTS) {
    logger.warn('Antifraude: total da conta excede limite', { totalInCents: bill.totalInCents });
    return { passed: false, reason: 'Valor total da conta excede o limite permitido.' };
  }

  if (bill.itemCount > MAX_ITEMS_PER_BILL) {
    logger.warn('Antifraude: muitos itens', { itemCount: bill.itemCount });
    return { passed: false, reason: `Maximo de ${MAX_ITEMS_PER_BILL} itens por conta.` };
  }

  if (bill.peopleCount > MAX_PEOPLE_PER_BILL) {
    logger.warn('Antifraude: muitas pessoas', { peopleCount: bill.peopleCount });
    return { passed: false, reason: `Maximo de ${MAX_PEOPLE_PER_BILL} pessoas por conta.` };
  }

  return { passed: true };
}

export function checkItemPrice(priceInCents: number): FraudCheckResult {
  if (priceInCents <= 0) {
    return { passed: false, reason: 'Preco do item deve ser maior que zero.' };
  }

  if (priceInCents > MAX_ITEM_PRICE_CENTS) {
    logger.warn('Antifraude: preco de item excede limite', { priceInCents });
    return { passed: false, reason: 'Preco do item excede o limite permitido.' };
  }

  return { passed: true };
}

export function checkBillCreationRate(userId: string): FraudCheckResult {
  const allowed = tryConsume(`bill_create_${userId}`, {
    maxTokens: 20,
    refillIntervalMs: 60_000,
  });

  if (!allowed) {
    logger.warn('Antifraude: rate limit de criacao de contas', { userId });
    return { passed: false, reason: 'Muitas contas criadas em pouco tempo. Aguarde um momento.' };
  }

  return { passed: true };
}

export function checkUploadRate(userId: string): FraudCheckResult {
  const allowed = tryConsume(`upload_${userId}`, {
    maxTokens: 10,
    refillIntervalMs: 60_000,
  });

  if (!allowed) {
    logger.warn('Antifraude: rate limit de uploads', { userId });
    return { passed: false, reason: 'Muitos uploads em pouco tempo. Aguarde um momento.' };
  }

  return { passed: true };
}

export function checkShareRate(userId: string): FraudCheckResult {
  const allowed = tryConsume(`share_${userId}`, {
    maxTokens: 15,
    refillIntervalMs: 60_000,
  });

  if (!allowed) {
    logger.warn('Antifraude: rate limit de compartilhamentos', { userId });
    return { passed: false, reason: 'Muitos compartilhamentos em pouco tempo. Aguarde um momento.' };
  }

  return { passed: true };
}
