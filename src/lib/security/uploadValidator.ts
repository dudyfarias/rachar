import { logger } from '../logger';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];

type ValidationResult = {
  valid: boolean;
  reason?: string;
};

export function validateMimeType(mimeType?: string | null): ValidationResult {
  if (!mimeType) {
    return { valid: false, reason: 'Tipo de arquivo nao informado.' };
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
    logger.warn('Upload rejeitado por tipo', { mimeType });
    return { valid: false, reason: `Tipo de arquivo nao permitido: ${mimeType}` };
  }

  return { valid: true };
}

export function validateFileSize(sizeInBytes?: number): ValidationResult {
  if (sizeInBytes === undefined || sizeInBytes === null) {
    return { valid: true };
  }

  if (sizeInBytes <= 0) {
    return { valid: false, reason: 'Arquivo vazio.' };
  }

  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    logger.warn('Upload rejeitado por tamanho', { sizeInBytes, maxBytes: MAX_FILE_SIZE_BYTES });
    return {
      valid: false,
      reason: `Arquivo muito grande (${Math.round(sizeInBytes / 1024 / 1024)}MB). Maximo: 10MB.`,
    };
  }

  return { valid: true };
}

export function validateMagicBytes(bytes: Uint8Array): ValidationResult {
  if (bytes.length < 4) {
    return { valid: false, reason: 'Arquivo corrompido ou muito pequeno.' };
  }

  const matchesJpeg = JPEG_MAGIC.every((b, i) => bytes[i] === b);
  const matchesPng = PNG_MAGIC.every((b, i) => bytes[i] === b);
  const matchesWebp = WEBP_RIFF.every((b, i) => bytes[i] === b);

  if (!matchesJpeg && !matchesPng && !matchesWebp) {
    logger.warn('Upload rejeitado por magic bytes invalidos');
    return { valid: false, reason: 'Formato de imagem nao reconhecido.' };
  }

  return { valid: true };
}

export function validateUpload(file: {
  mimeType?: string | null;
  sizeInBytes?: number;
}): ValidationResult {
  const mimeResult = validateMimeType(file.mimeType);
  if (!mimeResult.valid) return mimeResult;

  const sizeResult = validateFileSize(file.sizeInBytes);
  if (!sizeResult.valid) return sizeResult;

  return { valid: true };
}
