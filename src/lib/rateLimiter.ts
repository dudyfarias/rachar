type RateBucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, RateBucket>();

const DEFAULT_MAX_TOKENS = 10;
const DEFAULT_REFILL_INTERVAL_MS = 60_000;

type RateLimitOptions = {
  maxTokens?: number;
  refillIntervalMs?: number;
};

function getBucket(key: string, maxTokens: number): RateBucket {
  const existing = buckets.get(key);
  if (existing) return existing;
  const bucket: RateBucket = { tokens: maxTokens, lastRefill: Date.now() };
  buckets.set(key, bucket);
  return bucket;
}

function refill(bucket: RateBucket, maxTokens: number, refillIntervalMs: number) {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const refills = Math.floor(elapsed / refillIntervalMs);
  if (refills > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refills);
    bucket.lastRefill = now;
  }
}

export function tryConsume(key: string, options?: RateLimitOptions): boolean {
  const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;
  const refillIntervalMs = options?.refillIntervalMs ?? DEFAULT_REFILL_INTERVAL_MS;

  const bucket = getBucket(key, maxTokens);
  refill(bucket, maxTokens, refillIntervalMs);

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

export function remainingTokens(key: string, options?: RateLimitOptions): number {
  const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;
  const refillIntervalMs = options?.refillIntervalMs ?? DEFAULT_REFILL_INTERVAL_MS;

  const bucket = getBucket(key, maxTokens);
  refill(bucket, maxTokens, refillIntervalMs);
  return bucket.tokens;
}

export function resetBucket(key: string): void {
  buckets.delete(key);
}
