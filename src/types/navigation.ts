import type { ReceiptImage } from './receipt';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ReceiptCapture: undefined;
  ReceiptProcessing: { image: ReceiptImage };
  ReceiptReview: undefined;
  NewBill: undefined;
  AddPeople: undefined;
  AddItems: undefined;
  Result: undefined;
};
