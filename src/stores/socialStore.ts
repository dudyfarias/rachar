import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '../lib/id';
import { createAnalyticsEvent, trackEvent } from '../services/social/analytics';
import type {
  AnalyticsEvent,
  AnalyticsEventName,
  BillHistoryEntry,
  FriendAvatar,
  PixProfile,
  RecentFriend,
  RecurringGroup,
  RestaurantHistoryItem,
  SocialBillSnapshot,
} from '../types/social';

const avatarColors = ['#00A676', '#0F172A', '#B6F000', '#047857', '#334155', '#6A9300'];

const initialPixProfile: PixProfile = {
  city: 'Sao Paulo',
  description: 'Racha Rachaê',
  key: '',
  keyType: 'email',
  receiverName: '',
  txidPrefix: 'RACHAE',
};

type SocialState = {
  analyticsEvents: AnalyticsEvent[];
  billHistory: BillHistoryEntry[];
  pixProfile: PixProfile;
  recentFriends: RecentFriend[];
  recurringGroups: RecurringGroup[];
  restaurantHistory: RestaurantHistoryItem[];
  createRecurringGroup: (name: string, memberNames: string[]) => void;
  recordFinishedBill: (snapshot: SocialBillSnapshot) => void;
  track: (name: AnalyticsEventName, properties?: AnalyticsEvent['properties']) => void;
  updatePixProfile: (profile: Partial<PixProfile>) => void;
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function stableId(prefix: string, value: string) {
  return `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || createId(prefix)}`;
}

function createAvatar(name: string): FriendAvatar {
  const normalized = normalizeName(name);
  const initials = normalized
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const colorIndex = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;

  return {
    backgroundColor: avatarColors[colorIndex] ?? '#00A676',
    initials: initials || 'R',
  };
}

function upsertFriend(current: RecentFriend[], name: string, amountInCents: number, timestamp: string) {
  const normalized = normalizeName(name);
  const id = stableId('friend', normalized);
  const existing = current.find((friend) => friend.id === id);
  const nextFriend: RecentFriend = existing
    ? {
        ...existing,
        lastSeenAt: timestamp,
        totalBills: existing.totalBills + 1,
        totalInCents: existing.totalInCents + amountInCents,
      }
    : {
        avatar: createAvatar(normalized),
        firstSeenAt: timestamp,
        id,
        lastSeenAt: timestamp,
        name: normalized,
        totalBills: 1,
        totalInCents: amountInCents,
      };

  return [nextFriend, ...current.filter((friend) => friend.id !== id)]
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
    .slice(0, 12);
}

function upsertRestaurant(current: RestaurantHistoryItem[], place: string, totalInCents: number, timestamp: string) {
  const normalized = normalizeName(place);

  if (!normalized) {
    return current;
  }

  const id = stableId('restaurant', normalized);
  const existing = current.find((restaurant) => restaurant.id === id);
  const nextTotalBills = (existing?.totalBills ?? 0) + 1;
  const nextTotalInCents = (existing?.totalInCents ?? 0) + totalInCents;
  const nextRestaurant: RestaurantHistoryItem = existing
    ? {
        ...existing,
        averageTicketInCents: Math.round(nextTotalInCents / nextTotalBills),
        lastVisitedAt: timestamp,
        totalBills: nextTotalBills,
        totalInCents: nextTotalInCents,
      }
    : {
        averageTicketInCents: totalInCents,
        firstVisitedAt: timestamp,
        id,
        lastVisitedAt: timestamp,
        name: normalized,
        totalBills: 1,
        totalInCents,
      };

  return [nextRestaurant, ...current.filter((restaurant) => restaurant.id !== id)]
    .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt))
    .slice(0, 16);
}

function groupSignature(memberNames: string[]) {
  return memberNames.map(normalizeName).filter(Boolean).sort((a, b) => a.localeCompare(b)).join('|');
}

function upsertGroup(current: RecurringGroup[], name: string, memberNames: string[], timestamp: string) {
  const members = memberNames.map(normalizeName).filter(Boolean);

  if (members.length < 2) {
    return current;
  }

  const signature = groupSignature(members);
  const id = stableId('group', signature);
  const existing = current.find((group) => group.id === id);
  const nextGroup: RecurringGroup = existing
    ? {
        ...existing,
        billCount: existing.billCount + 1,
        lastUsedAt: timestamp,
        name: existing.name || name,
      }
    : {
        avatar: createAvatar(name),
        billCount: 1,
        createdAt: timestamp,
        id,
        lastUsedAt: timestamp,
        memberNames: members,
        name,
      };

  return [nextGroup, ...current.filter((group) => group.id !== id)]
    .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))
    .slice(0, 10);
}

function addEvent(current: AnalyticsEvent[], event: AnalyticsEvent) {
  return [event, ...current].slice(0, 120);
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      analyticsEvents: [],
      billHistory: [],
      pixProfile: initialPixProfile,
      recentFriends: [],
      recurringGroups: [],
      restaurantHistory: [],
      createRecurringGroup: (name, memberNames) =>
        set((state) => {
          const event = createAnalyticsEvent('group_created', { members: memberNames.length });

          return {
            analyticsEvents: addEvent(state.analyticsEvents, event),
            recurringGroups: upsertGroup(state.recurringGroups, normalizeName(name), memberNames, event.timestamp),
          };
        }),
      recordFinishedBill: ({ draft, result }) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const historyEntry: BillHistoryEntry = {
            createdAt: timestamp,
            id: createId('history'),
            peopleCount: result.people.length,
            place: draft.place,
            title: draft.title,
            totalInCents: result.totalInCents,
          };
          const billEvent = trackEvent('bill_finished', {
            people: result.people.length,
            totalInCents: result.totalInCents,
          });
          const restaurantEvent =
            draft.place && state.restaurantHistory.some((restaurant) => restaurant.name.toLowerCase() === draft.place.toLowerCase())
              ? createAnalyticsEvent('restaurant_revisited', { place: draft.place })
              : null;
          const nextFriends = result.people.reduce(
            (friends, person) => upsertFriend(friends, person.name, person.totalInCents, timestamp),
            state.recentFriends,
          );

          return {
            analyticsEvents: restaurantEvent
              ? addEvent(addEvent(state.analyticsEvents, billEvent), restaurantEvent)
              : addEvent(state.analyticsEvents, billEvent),
            billHistory: [historyEntry, ...state.billHistory].slice(0, 30),
            recentFriends: nextFriends,
            recurringGroups: upsertGroup(state.recurringGroups, draft.title || 'Grupo recorrente', result.people.map((person) => person.name), timestamp),
            restaurantHistory: upsertRestaurant(state.restaurantHistory, draft.place, result.totalInCents, timestamp),
          };
        }),
      track: (name, properties) =>
        set((state) => {
          const event = trackEvent(name, properties);

          return { analyticsEvents: addEvent(state.analyticsEvents, event) };
        }),
      updatePixProfile: (profile) =>
        set((state) => ({
          pixProfile: {
            ...state.pixProfile,
            ...profile,
          },
        })),
    }),
    {
      name: 'rachae-social-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
