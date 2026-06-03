export type ReceiptProcessingStep = 'idle' | 'prepare-image' | 'upload-image' | 'ocr' | 'ai-parser' | 'validate';

export type ReceiptWarningSeverity = 'error' | 'info' | 'warning';

export type ReceiptWarning = {
  code: string;
  message: string;
  severity: ReceiptWarningSeverity;
};

export type ReceiptImage = {
  fileName?: string | null;
  height?: number;
  mimeType?: string | null;
  sizeInBytes?: number;
  storageBucket?: string;
  storagePath?: string;
  uploadedUrl?: string;
  uri: string;
  width?: number;
};

export type ReceiptOcrResult = {
  confidence?: number;
  provider: string;
  rawText: string;
  warnings: ReceiptWarning[];
};

export type ParsedReceiptItem = {
  confidence?: number;
  id: string;
  name: string;
  quantity: number;
  totalInCents: number;
  unitPriceInCents: number;
};

export type ParsedReceipt = {
  discountInCents: number;
  items: ParsedReceiptItem[];
  provider: string;
  restaurantName: string | null;
  serviceFeeInCents: number;
  subtotalInCents: number;
  totalInCents: number;
  warnings: ReceiptWarning[];
};

export type ReceiptProcessingResult = {
  image: ReceiptImage;
  ocr: ReceiptOcrResult;
  receipt: ParsedReceipt;
};
