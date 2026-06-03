import { create } from 'zustand';

import { createId } from '../lib/id';
import { isSupabaseConfigured } from '../lib/supabase/client';
import * as billRepo from '../lib/supabase/billRepository';
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
  isLoadingTemplate: boolean;
  addItem: (item: Omit<BillItem, 'id'>) => void;
  addPerson: (name: string) => void;
  assignEmptyItemsToAllPeople: () => void;
  importReceiptDraft: (receipt: ParsedReceipt) => void;
  loadBillAsTemplate: (billId: string) => Promise<void>;
  removeItem: (itemId: string) => void;
  removePerson: (personId: string) => void;
  resetDraft: () => void;
  updateBillMeta: (payload: Partial<Pick<BillDraft, 'discountInCents' | 'place' | 'serviceFeeInCents' | 'title'>>) => void;
};

export const useBillStore = create<BillState>((set) => ({
  draft: initialDraft,
  isLoadingTemplate: false,
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
  loadBillAsTemplate: async (billId) => {
    if (!isSupabaseConfigured) return;

    set({ isLoadingTemplate: true });

    try {
      const { bill, people, items } = await billRepo.getBillById(billId);

      const newPeople: BillPerson[] = people.map((p) => ({
        id: createId('person'),
        name: p.name,
      }));

      const newItems: BillItem[] = items.map((item) => ({
        id: createId('item'),
        name: item.name,
        priceInCents: item.price_cents,
        participantIds: newPeople.map((p) => p.id),
      }));

      set({
        draft: {
          title: bill.title,
          place: bill.place ?? '',
          serviceFeeInCents: bill.service_fee_cents,
          discountInCents: bill.discount_cents,
          people: newPeople,
          items: newItems,
        },
        isLoadingTemplate: false,
      });
    } catch {
      set({ isLoadingTemplate: false });
    }
  },
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
