import { formatCurrency } from '../../lib/formatCurrency';
import type { BillDraft, SplitSummary } from '../../types/billing';

type GenerateWhatsAppSummaryInput = {
  draft: BillDraft;
  pixCopyPaste?: string;
  pixKey?: string;
  result: SplitSummary;
};

export function generateWhatsAppSummary({ draft, pixCopyPaste, pixKey, result }: GenerateWhatsAppSummaryInput) {
  const title = draft.title || 'Racha';
  const place = draft.place ? ` - ${draft.place}` : '';
  const lines = [
    `*${title}${place}*`,
    `Total: ${formatCurrency(result.totalInCents)}`,
    '',
    '*Quanto cada pessoa paga:*',
    ...result.people.map((person) => `- ${person.name}: ${formatCurrency(person.totalInCents)}`),
    '',
    `Subtotal: ${formatCurrency(result.subtotalInCents)}`,
    `Taxa: ${formatCurrency(result.serviceFeeInCents)}`,
    `Desconto: ${formatCurrency(result.discountInCents)}`,
  ];

  if (pixKey) {
    lines.push('', `Chave Pix: ${pixKey}`);
  }

  if (pixCopyPaste) {
    lines.push('', '*Pix copia e cola:*', pixCopyPaste);
  }

  lines.push('', 'Gerado no Rachae.');

  return lines.join('\n');
}
