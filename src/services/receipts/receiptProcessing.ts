import type { ReceiptImage, ReceiptProcessingResult, ReceiptProcessingStep } from '../../types/receipt';
import { extractReceiptText } from './receiptOcr';
import { prepareReceiptImage } from './receiptImage';
import { parseReceiptWithAi } from './receiptParser';
import { uploadReceiptImage } from './receiptUpload';

type ProcessReceiptInput = {
  image: ReceiptImage;
  onStep?: (step: ReceiptProcessingStep) => void;
  userId?: string | null;
};

export async function processReceiptImage({ image, onStep, userId }: ProcessReceiptInput): Promise<ReceiptProcessingResult> {
  onStep?.('prepare-image');
  const preparedImage = await prepareReceiptImage(image);

  onStep?.('upload-image');
  const upload = await uploadReceiptImage({ image: preparedImage, userId });

  onStep?.('ocr');
  const ocr = await extractReceiptText({ image: upload.image });

  onStep?.('ai-parser');
  const receipt = await parseReceiptWithAi({
    imageUrl: upload.image.uploadedUrl,
    ocrText: ocr.rawText,
  });

  onStep?.('validate');

  return {
    image: upload.image,
    ocr: {
      ...ocr,
      warnings: [...upload.warnings, ...ocr.warnings],
    },
    receipt: {
      ...receipt,
      warnings: [...upload.warnings, ...ocr.warnings, ...receipt.warnings],
    },
  };
}
