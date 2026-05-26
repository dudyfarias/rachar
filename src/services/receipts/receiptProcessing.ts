import { logger } from '../../lib/logger';
import { validateUpload } from '../../lib/security/uploadValidator';
import { checkUploadRate } from '../../lib/security/antiFraud';
import type { ReceiptImage, ReceiptProcessingResult, ReceiptProcessingStep, ReceiptWarning } from '../../types/receipt';
import { extractReceiptText } from './receiptOcr';
import { prepareReceiptImage } from './receiptImage';
import { recordParsedReceipt, recordLayoutHint } from './receiptMemory';
import { parseReceiptWithAi } from './receiptParser';
import { detectLayout, normalizeReceiptText, extractRestaurantName } from './receiptPatterns';
import { uploadReceiptImage } from './receiptUpload';

type ProcessReceiptInput = {
  image: ReceiptImage;
  onStep?: (step: ReceiptProcessingStep) => void;
  userId?: string | null;
};

function deduplicateWarnings(warnings: ReceiptWarning[]): ReceiptWarning[] {
  const seen = new Set<string>();
  return warnings.filter((w) => {
    const key = `${w.code}:${w.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function processReceiptImage({ image, onStep, userId }: ProcessReceiptInput): Promise<ReceiptProcessingResult> {
  if (userId && userId !== 'demo-user') {
    const rateCheck = checkUploadRate(userId);
    if (!rateCheck.passed) {
      throw new Error(rateCheck.reason);
    }
  }

  const uploadValidation = validateUpload({
    mimeType: image.mimeType,
    sizeInBytes: image.sizeInBytes,
  });
  if (!uploadValidation.valid) {
    throw new Error(uploadValidation.reason);
  }

  logger.info('Iniciando processamento de recibo', { userId });

  onStep?.('prepare-image');
  const preparedImage = await prepareReceiptImage(image);

  onStep?.('upload-image');
  const upload = await uploadReceiptImage({ image: preparedImage, userId });

  onStep?.('ocr');
  const ocr = await extractReceiptText({ image: upload.image });

  const normalizedText = normalizeReceiptText(ocr.rawText);
  const layoutMatch = detectLayout(normalizedText);

  if (layoutMatch) {
    logger.info('Layout detectado', { layout: layoutMatch.layoutName, confidence: layoutMatch.confidence });
  }

  onStep?.('ai-parser');
  const receipt = await parseReceiptWithAi({
    imageUrl: upload.image.uploadedUrl,
    ocrText: normalizedText,
  });

  onStep?.('validate');

  const allWarnings = deduplicateWarnings([
    ...upload.warnings,
    ...ocr.warnings,
    ...receipt.warnings,
  ]);

  recordParsedReceipt({
    restaurantName: receipt.restaurantName ?? extractRestaurantName(normalizedText),
    itemNames: receipt.items.map((i) => i.name),
    provider: receipt.provider,
    parsedAt: new Date().toISOString(),
    corrected: false,
  }).catch(() => {});

  if (layoutMatch && receipt.restaurantName) {
    const restaurantKey = receipt.restaurantName.toLowerCase().replace(/\s+/g, '-');
    recordLayoutHint(restaurantKey, {
      provider: receipt.provider,
      quantityPosition: layoutMatch.quantityPosition,
      priceColumns: receipt.items[0]?.unitPriceInCents !== receipt.items[0]?.totalInCents ? 2 : 1,
      hasSeparatorLine: /[-=]{3,}/.test(normalizedText),
      confidence: layoutMatch.confidence,
    }).catch(() => {});
  }

  logger.info('Recibo processado', {
    items: receipt.items.length,
    provider: receipt.provider,
    warnings: allWarnings.length,
  });

  return {
    image: upload.image,
    ocr: {
      ...ocr,
      warnings: deduplicateWarnings([...upload.warnings, ...ocr.warnings]),
    },
    receipt: {
      ...receipt,
      warnings: allWarnings,
    },
  };
}
