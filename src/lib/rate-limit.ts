import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type LimiterStore = typeof globalThis & {
  __gymOsRateLimitStore?: Map<string, RateLimitBucket>;
  __gymOsRateLimiters?: Map<string, Ratelimit>;
  __gymOsRateLimitRedis?: Redis | null;
};

const globalStore = globalThis as LimiterStore;

function getFallbackStore() {
  if (!globalStore.__gymOsRateLimitStore) {
    globalStore.__gymOsRateLimitStore = new Map();
  }

  return globalStore.__gymOsRateLimitStore;
}

function getRedisClient() {
  if (globalStore.__gymOsRateLimitRedis !== undefined) {
    return globalStore.__gymOsRateLimitRedis;
  }

  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    globalStore.__gymOsRateLimitRedis = Redis.fromEnv();
  } else {
    globalStore.__gymOsRateLimitRedis = null;
  }

  return globalStore.__gymOsRateLimitRedis;
}

function formatWindow(windowMs: number) {
  const seconds = Math.max(1, Math.ceil(windowMs / 1000));

  if (seconds % 3600 === 0) {
    return `${seconds / 3600} h` as const;
  }

  if (seconds % 60 === 0) {
    return `${seconds / 60} m` as const;
  }

  return `${seconds} s` as const;
}

function getRemoteLimiter(options: RateLimitOptions) {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  if (!globalStore.__gymOsRateLimiters) {
    globalStore.__gymOsRateLimiters = new Map();
  }

  const cacheKey = `${options.limit}:${options.windowMs}`;
  const existing = globalStore.__gymOsRateLimiters.get(cacheKey);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      options.limit,
      formatWindow(options.windowMs),
    ),
    analytics: true,
    prefix: "gymos",
  });

  globalStore.__gymOsRateLimiters.set(cacheKey, limiter);
  return limiter;
}

function consumeFallbackRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const store = getFallbackStore();
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
      retryAfterMs: Math.max(existing.resetAt - now, 0),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(options.limit - existing.count, 0),
    retryAfterMs: Math.max(existing.resetAt - now, 0),
  };
}

export async function consumeRateLimit(key: string, options: RateLimitOptions) {
  const remoteLimiter = getRemoteLimiter(options);

  if (!remoteLimiter) {
    return consumeFallbackRateLimit(key, options);
  }

  const result = await remoteLimiter.limit(key);

  return {
    allowed: result.success,
    remaining: result.remaining,
    retryAfterMs: Math.max(result.reset - Date.now(), 0),
  };
}

export function getRequestIp(
  request: Request | { headers: Headers; ip?: string },
) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  return ("ip" in request && request.ip) || "unknown";
}
