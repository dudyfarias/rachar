import { create } from 'zustand';

import { createId } from '../lib/id';
import type { BillDraft, BillItem, BillPerson } from '../types/billing';

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
