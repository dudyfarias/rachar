export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100);
}

export function parseCurrencyToCents(value: string) {
  const numeric = value.replace(/\D/g, '');
  return Number(numeric || '0');
}

export function maskCurrencyInput(value: string) {
  return formatCurrency(parseCurrencyToCents(value));
}
