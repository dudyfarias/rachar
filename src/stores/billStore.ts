import { create } from 'zustand';

import { createId } from '../lib/id';
import type { BillDraft, BillItem, BillPerson } from '../types/billing';
import type { ParsedReceipt } from '../types/receipt';

const initialDraft: BillDraft = {
  title: '',
  place: '',
  serviceFeeInCents: 0,
  discountInCents: 0,
  people: [],
  items: [],
};

type BillState = {
  draft: BillDraft;
  addItem: (item: Omit<BillItem, 'id'>) => void;
  addPerson: (name: string) => void;
  assignEmptyItemsToAllPeople: () => void;
  importReceiptDraft: (receipt: ParsedReceipt) => void;
  removeItem: (itemId: string) => void;
  removePerson: (personId: string) => void;
  resetDraft: () => void;
  updateBillMeta: (payload: Partial<Pick<BillDraft, 'discountInCents' | 'place' | 'serviceFeeInCents' | 'title'>>) => void;
};

export const useBillStore = create<BillState>((set) => ({
  draft: initialDraft,
  addItem: (item) =>
    set((state) => ({
      draft: {
        ...state.draft,
        items: [...state.draft.items, { ...item, id: createId('item') }],
      },
    })),
  addPerson: (name) =>
    set((state) => {
      const person: BillPerson = { id: createId('person'), name: name.trim() };

      return {
        draft: {
          ...state.draft,
          people: [...state.draft.people, person],
        },
      };
    }),
  assignEmptyItemsToAllPeople: () =>
    set((state) => {
      const participantIds = state.draft.people.map((person) => person.id);

      return {
        draft: {
          ...state.draft,
          items: state.draft.items.map((item) => ({
            ...item,
            participantIds: item.participantIds.length > 0 ? item.participantIds : participantIds,
          })),
        },
      };
    }),
  importReceiptDraft: (receipt) =>
    set({
      draft: {
        discountInCents: receipt.discountInCents,
        items: receipt.items.map((item) => ({
          id: createId('item'),
          name: item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name,
          participantIds: [],
          priceInCents: item.totalInCents,
        })),
        people: [],
        place: receipt.restaurantName ?? '',
        serviceFeeInCents: receipt.serviceFeeInCents,
        title: receipt.restaurantName ? `Conta ${receipt.restaurantName}` : 'Conta escaneada',
      },
    }),
  removeItem: (itemId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        items: state.draft.items.filter((item) => item.id !== itemId),
      },
    })),
  removePerson: (personId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        people: state.draft.people.filter((person) => person.id !== personId),
        items: state.draft.items
          .map((item) => ({
            ...item,
            participantIds: item.participantIds.filter((id) => id !== personId),
          }))
          .filter((item) => item.participantIds.length > 0),
      },
    })),
  resetDraft: () => set({ draft: initialDraft }),
  updateBillMeta: (payload) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...payload,
      },
    })),
}));
