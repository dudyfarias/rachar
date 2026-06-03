import type { BillDraft, CurrencyCents, SplitSummary } from './billing';

export type AnalyticsEventName =
  | 'bill_finished'
  | 'group_created'
  | 'history_opened'
  | 'pix_key_copied'
  | 'pix_qr_viewed'
  | 'retention_return_home'
  | 'restaurant_revisited'
  | 'whatsapp_summary_shared';

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null>;
  timestamp: string;
};

export type FriendAvatar = {
  backgroundColor: string;
  initials: string;
};

export type RecentFriend = {
  avatar: FriendAvatar;
  firstSeenAt: string;
  id: string;
  lastSeenAt: string;
  name: string;
  totalBills: number;
  totalInCents: CurrencyCents;
};

export type RestaurantHistoryItem = {
  averageTicketInCents: CurrencyCents;
  firstVisitedAt: string;
  id: string;
  lastVisitedAt: string;
  name: string;
  totalBills: number;
  totalInCents: CurrencyCents;
};

export type RecurringGroup = {
  avatar: FriendAvatar;
  billCount: number;
  createdAt: string;
  id: string;
  lastUsedAt: string;
  memberNames: string[];
  name: string;
};

export type BillHistoryEntry = {
  createdAt: string;
  id: string;
  peopleCount: number;
  place: string;
  title: string;
  totalInCents: CurrencyCents;
};

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export type PixProfile = {
  city: string;
  description: string;
  key: string;
  keyType: PixKeyType;
  receiverName: string;
  txidPrefix: string;
};

export type SocialBillSnapshot = {
  draft: BillDraft;
  result: SplitSummary;
};
