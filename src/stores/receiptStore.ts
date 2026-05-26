import { create } from 'zustand';

import type { ParsedReceipt, ReceiptImage, ReceiptOcrResult, ReceiptProcessingStep } from '../types/receipt';

type ReceiptState = {
  currentStep: ReceiptProcessingStep;
  error: string | null;
  image: ReceiptImage | null;
  ocr: ReceiptOcrResult | null;
  receipt: ParsedReceipt | null;
  reset: () => void;
  setError: (error: string | null) => void;
  setImage: (image: ReceiptImage | null) => void;
  setResult: (payload: { image: ReceiptImage; ocr: ReceiptOcrResult; receipt: ParsedReceipt }) => void;
  setStep: (step: ReceiptProcessingStep) => void;
};

export const useReceiptStore = create<ReceiptState>((set) => ({
  currentStep: 'idle',
  error: null,
  image: null,
  ocr: null,
  receipt: null,
  reset: () => set({ currentStep: 'idle', error: null, image: null, ocr: null, receipt: null }),
  setError: (error) => set({ error }),
  setImage: (image) => set({ image }),
  setResult: ({ image, ocr, receipt }) => set({ currentStep: 'validate', error: null, image, ocr, receipt }),
  setStep: (currentStep) => set({ currentStep }),
}));
