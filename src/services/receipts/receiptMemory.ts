import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_KEY = 'rachae_receipt_memory';
const MAX_ENTRIES = 50;

type ReceiptMemoryEntry = {
  restaurantName: string | null;
  itemNames: string[];
  provider: string;
  parsedAt: string;
  corrected: boolean;
};

type ReceiptMemoryStore = {
  entries: ReceiptMemoryEntry[];
  layoutHints: Record<string, LayoutHint>;
};

type LayoutHint = {
  provider: string;
  quantityPosition: 'before-name' | 'after-name' | 'none';
  priceColumns: number;
  hasSeparatorLine: boolean;
  confidence: number;
  seenCount: number;
};

const defaultStore: ReceiptMemoryStore = { entries: [], layoutHints: {} };

async function loadStore(): Promise<ReceiptMemoryStore> {
  try {
    const raw = await AsyncStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...defaultStore };
    return JSON.parse(raw) as ReceiptMemoryStore;
  } catch {
    return { ...defaultStore };
  }
}

async function saveStore(store: ReceiptMemoryStore): Promise<void> {
  try {
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(store));
  } catch {
    // non-critical
  }
}

export async function recordParsedReceipt(entry: ReceiptMemoryEntry): Promise<void> {
  const store = await loadStore();
  store.entries = [entry, ...store.entries].slice(0, MAX_ENTRIES);
  await saveStore(store);
}

export async function recordLayoutHint(
  restaurantKey: string,
  hint: Omit<LayoutHint, 'seenCount'>,
): Promise<void> {
  const store = await loadStore();
  const existing = store.layoutHints[restaurantKey];

  if (existing) {
    existing.seenCount += 1;
    existing.confidence = Math.min(0.99, existing.confidence + 0.05);
    existing.quantityPosition = hint.quantityPosition;
    existing.priceColumns = hint.priceColumns;
    existing.hasSeparatorLine = hint.hasSeparatorLine;
  } else {
    store.layoutHints[restaurantKey] = { ...hint, seenCount: 1 };
  }

  await saveStore(store);
}

export async function getLayoutHint(restaurantKey: string): Promise<LayoutHint | null> {
  const store = await loadStore();
  return store.layoutHints[restaurantKey] ?? null;
}

export async function getFrequentItems(limit = 20): Promise<Array<{ name: string; count: number }>> {
  const store = await loadStore();
  const counts = new Map<string, number>();

  for (const entry of store.entries) {
    for (const name of entry.itemNames) {
      const normalized = name.toLowerCase().trim();
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getKnownRestaurants(): Promise<string[]> {
  const store = await loadStore();
  const names = new Set<string>();
  for (const entry of store.entries) {
    if (entry.restaurantName) names.add(entry.restaurantName);
  }
  return [...names];
}

export async function clearMemory(): Promise<void> {
  await AsyncStorage.removeItem(MEMORY_KEY);
}
