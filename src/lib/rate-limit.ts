type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __gymOsRateLimitStore?: Map<string, RateLimitBucket>;
};

function getStore() {
  if (!globalStore.__gymOsRateLimitStore) {
    globalStore.__gymOsRateLimitStore = new Map();
  }

  return globalStore.__gymOsRateLimitStore;
}

export function consumeRateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
  },
) {
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket = {
      count: 1,
      resetAt: now + options.windowMs,
    };

    store.set(key, bucket);

    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfterMs: options.windowMs,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfterMs: existing.resetAt - now,
  };
}
