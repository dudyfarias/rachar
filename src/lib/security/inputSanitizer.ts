const SCRIPT_PATTERN = /<script[\s>]|javascript:|on\w+\s*=/gi;
const SQL_INJECTION_PATTERN = /(\b(union|select|insert|update|delete|drop|alter|exec|execute)\b.*\b(from|into|table|where|set)\b)/gi;
const MAX_INPUT_LENGTH = 500;

export function sanitizeText(value: string, maxLength = MAX_INPUT_LENGTH): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeName(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s.\-']/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

export function sanitizeCurrency(value: string): string {
  return value.replace(/[^\d,.\-R$\s]/g, '').trim();
}

export function containsSuspiciousContent(value: string): boolean {
  return SCRIPT_PATTERN.test(value) || SQL_INJECTION_PATTERN.test(value);
}

export function sanitizeSearchQuery(value: string): string {
  return value
    .replace(/[%_\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}
