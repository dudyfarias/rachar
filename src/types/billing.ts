export type CurrencyCents = number;

export type BillPerson = {
  id: string;
  name: string;
};

export type BillItem = {
  id: string;
  name: string;
  priceInCents: CurrencyCents;
  participantIds: string[];
};

export type BillDraft = {
  title: string;
  place: string;
  serviceFeeInCents: CurrencyCents;
  discountInCents: CurrencyCents;
  people: BillPerson[];
  items: BillItem[];
};

export type ItemContribution = {
  itemId: string;
  itemName: string;
  amountInCents: CurrencyCents;
};

export type PersonSplit = {
  personId: string;
  name: string;
  itemSubtotalInCents: CurrencyCents;
  serviceFeeInCents: CurrencyCents;
  discountInCents: CurrencyCents;
  totalInCents: CurrencyCents;
  items: ItemContribution[];
};

export type SplitSummary = {
  subtotalInCents: CurrencyCents;
  serviceFeeInCents: CurrencyCents;
  discountInCents: CurrencyCents;
  totalInCents: CurrencyCents;
  people: PersonSplit[];
};
