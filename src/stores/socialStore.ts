import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '../lib/id';
import { isSupabaseConfigured } from '../lib/supabase/client';
import * as socialRepo from '../lib/supabase/socialRepository';
import * as billRepo from '../lib/supabase/billRepository';
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
  isSyncing: boolean;
  pixProfile: PixProfile;
  recentFriends: RecentFriend[];
  recurringGroups: RecurringGroup[];
  restaurantHistory: RestaurantHistoryItem[];
  createRecurringGroup: (name: string, memberNames: string[], userId?: string | null) => void;
  loadFromSupabase: (userId: string) => Promise<void>;
  recordFinishedBill: (snapshot: SocialBillSnapshot, userId?: string | null) => void;
  track: (name: AnalyticsEventName, properties?: AnalyticsEvent['properties']) => void;
  updatePixProfile: (profile: Partial<PixProfile>, userId?: string | null) => void;
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

function isDemoUser(userId?: string | null) {
  return !userId || userId === 'demo-user';
}

function shouldSync(userId?: string | null) {
  return isSupabaseConfigured && !isDemoUser(userId);
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      analyticsEvents: [],
      billHistory: [],
      isSyncing: false,
      pixProfile: initialPixProfile,
      recentFriends: [],
      recurringGroups: [],
      restaurantHistory: [],

      loadFromSupabase: async (userId) => {
        if (!shouldSync(userId)) return;

        set({ isSyncing: true });

        try {
          const [bills, friends, restaurants, groups, pixProfile] = await Promise.all([
            billRepo.listBills(userId),
            socialRepo.listRecentFriends(userId),
            socialRepo.listRestaurants(userId),
            socialRepo.listRecurringGroups(userId),
            socialRepo.loadPixProfile(userId),
          ]);

          const billHistory: BillHistoryEntry[] = bills.map((b) => ({
            createdAt: b.created_at,
            id: b.id,
            peopleCount: 0,
            place: b.place ?? '',
            title: b.title,
            totalInCents: b.total_cents,
          }));

          const recentFriends: RecentFriend[] = friends.map((f) => ({
            avatar: { backgroundColor: f.background_color, initials: f.initials },
            firstSeenAt: f.first_seen_at,
            id: f.id,
            lastSeenAt: f.last_seen_at,
            name: f.name,
            totalBills: f.total_bills,
            totalInCents: f.total_in_cents,
          }));

          const restaurantHistory: RestaurantHistoryItem[] = restaurants.map((r) => ({
            averageTicketInCents: r.average_ticket_in_cents,
            firstVisitedAt: r.first_visited_at,
            id: r.id,
            lastVisitedAt: r.last_visited_at,
            name: r.name,
            totalBills: r.total_bills,
            totalInCents: r.total_in_cents,
          }));

          const recurringGroups: RecurringGroup[] = groups.map((g) => {
            const members = (g.recurring_group_members as Array<{ name: string }>) ?? [];
            return {
              avatar: createAvatar(g.name),
              billCount: g.bill_count,
              createdAt: g.created_at,
              id: g.id,
              lastUsedAt: g.last_used_at,
              memberNames: members.map((m) => m.name),
              name: g.name,
            };
          });

          set({
            billHistory,
            isSyncing: false,
            recentFriends,
            recurringGroups,
            restaurantHistory,
            ...(pixProfile ? { pixProfile } : {}),
          });
        } catch {
          set({ isSyncing: false });
        }
      },

      createRecurringGroup: (name, memberNames, userId) => {
        const normalizedName = normalizeName(name);
        const normalizedMembers = memberNames.map(normalizeName).filter(Boolean);

        if (normalizedMembers.length < 2) {
          return;
        }

        set((state) => {
          const event = createAnalyticsEvent('group_created', { members: memberNames.length });

          return {
            analyticsEvents: addEvent(state.analyticsEvents, event),
            recurringGroups: upsertGroup(state.recurringGroups, normalizedName, normalizedMembers, event.timestamp),
          };
        });

        if (shouldSync(userId)) {
          socialRepo.upsertRecurringGroup(userId!, normalizedName, normalizedMembers).catch(() => {});
        }
      },

      recordFinishedBill: ({ draft, result }, userId) => {
        const timestamp = new Date().toISOString();

        const historyEntryId = createId('history');

        set((state) => {
          const historyEntry: BillHistoryEntry = {
            createdAt: timestamp,
            id: historyEntryId,
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
        });

        if (shouldSync(userId)) {
          syncBillToSupabase(userId!, draft, result, timestamp).then((billId) => {
            if (!billId) {
              return;
            }

            set((state) => ({
              billHistory: state.billHistory.map((entry) =>
                entry.id === historyEntryId ? { ...entry, id: billId } : entry,
              ),
            }));
          });
        }
      },

      track: (name, properties) =>
        set((state) => {
          const event = trackEvent(name, properties);

          return { analyticsEvents: addEvent(state.analyticsEvents, event) };
        }),

      updatePixProfile: (profile, userId) => {
        set((state) => ({
          pixProfile: { ...state.pixProfile, ...profile },
        }));

        if (shouldSync(userId)) {
          const fullProfile = get().pixProfile;
          socialRepo.savePixProfile(userId!, fullProfile).catch(() => {});
        }
      },
    }),
    {
      name: 'rachae-social-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        billHistory: state.billHistory,
        pixProfile: state.pixProfile,
        recentFriends: state.recentFriends,
        recurringGroups: state.recurringGroups,
        restaurantHistory: state.restaurantHistory,
      }),
    },
  ),
);

async function syncBillToSupabase(
  userId: string,
  draft: import('../types/billing').BillDraft,
  result: import('../types/billing').SplitSummary,
  timestamp: string,
): Promise<string | null> {
  try {
    const billId = await billRepo.createBill(userId, draft, result);

    const syncPromises: Promise<unknown>[] = [];

    for (const person of result.people) {
      const normalized = normalizeName(person.name);
      const avatar = createAvatar(normalized);
      syncPromises.push(
        socialRepo.upsertRecentFriend(userId, normalized, avatar.initials, avatar.backgroundColor, person.totalInCents),
      );
    }

    const place = normalizeName(draft.place);
    if (place) {
      syncPromises.push(socialRepo.upsertRestaurant(userId, place, result.totalInCents));
    }

    const memberNames = result.people.map((p) => normalizeName(p.name));
    if (memberNames.length >= 2) {
      syncPromises.push(socialRepo.upsertRecurringGroup(userId, draft.title || 'Grupo recorrente', memberNames));
    }

    await Promise.allSettled(syncPromises);
    return billId;
  } catch {
    // sync failure is non-blocking — local state is already updated
    return null;
  }
}
