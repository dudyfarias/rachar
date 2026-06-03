import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const CACHE_PREFIX = 'rachae_cache_';
const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();

  const memEntry = memoryCache.get(fullKey) as CacheEntry<T> | undefined;
  if (memEntry && memEntry.expiresAt > now) {
    return memEntry.data;
  }

  try {
    const raw = await AsyncStorage.getItem(fullKey);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt <= now) {
      memoryCache.delete(fullKey);
      AsyncStorage.removeItem(fullKey);
      return null;
    }
    memoryCache.set(fullKey, entry);
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, data: T, ttlMs: number): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
  memoryCache.set(fullKey, entry);
  try {
    await AsyncStorage.setItem(fullKey, JSON.stringify(entry));
  } catch {
    // disk failure non-critical — memory cache still active
  }
}

export async function cacheInvalidate(key: string): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  memoryCache.delete(fullKey);
  await AsyncStorage.removeItem(fullKey);
}

export async function cacheInvalidateByPrefix(prefix: string): Promise<void> {
  const fullPrefix = `${CACHE_PREFIX}${prefix}`;
  for (const k of memoryCache.keys()) {
    if (k.startsWith(fullPrefix)) memoryCache.delete(k);
  }
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const matching = allKeys.filter((k) => k.startsWith(fullPrefix));
    if (matching.length > 0) await AsyncStorage.multiRemove(matching);
  } catch {
    // non-critical
  }
}
