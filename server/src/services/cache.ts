import { Redis } from 'ioredis';
import { env } from '../config/env.js';

type MemoryEntry = { value: string; expiresAt: number };

let client: Redis | null = null;
let lastErrorAt = 0;
const memory = new Map<string, MemoryEntry>();

const logError = (error: Error) => {
  const now = Date.now();
  if (now - lastErrorAt > 30_000) {
    lastErrorAt = now;
    console.error('[cache] redis error:', error.message);
  }
};

const getClient = () => {
  if (!env.redisUrl) return null;
  if (!client) {
    client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 2,
      connectTimeout: 2_000,
      retryStrategy: (times) => Math.min(times * 200, 2_000),
    });
    client.on('error', logError);
  }
  return client;
};

const memoryGet = (key: string) => {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
};

export const cacheGet = async (key: string): Promise<string | null> => {
  const redis = getClient();
  if (redis) {
    try {
      return await redis.get(env.redisKeyPrefix + key);
    } catch (error) {
      logError(error as Error);
    }
  }
  return memoryGet(key);
};

export const cacheSet = async (key: string, value: string, ttlMs: number) => {
  const redis = getClient();
  if (redis) {
    try {
      await redis.set(env.redisKeyPrefix + key, value, 'PX', Math.max(1, ttlMs));
      return;
    } catch (error) {
      logError(error as Error);
    }
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const cacheDelete = async (...keys: string[]) => {
  const redis = getClient();
  if (redis) {
    try {
      await redis.del(...keys.map((key) => env.redisKeyPrefix + key));
    } catch (error) {
      logError(error as Error);
    }
  }
  for (const key of keys) memory.delete(key);
};

export const cacheDeleteByPrefix = async (prefix: string) => {
  const redis = getClient();
  if (redis) {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          `${env.redisKeyPrefix}${prefix}*`,
          'COUNT',
          200,
        );
        cursor = nextCursor;
        if (keys.length) await redis.del(...keys);
      } while (cursor !== '0');
    } catch (error) {
      logError(error as Error);
    }
  }
  for (const key of [...memory.keys()]) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
};


const memoryCounters = new Map<string, { count: number; expiresAt: number }>();

export const cacheIncrement = async (key: string, ttlMs: number): Promise<number> => {
  const redis = getClient();
  if (redis) {
    try {
      const prefixed = env.redisKeyPrefix + key;
      const count = await redis.incr(prefixed);
      if (count === 1) await redis.pexpire(prefixed, Math.max(1, ttlMs));
      return count;
    } catch (error) {
      logError(error as Error);
    }
  }

  const now = Date.now();
  const current = memoryCounters.get(key);
  if (!current || current.expiresAt <= now) {
    const next = { count: 1, expiresAt: now + ttlMs };
    memoryCounters.set(key, next);
    return 1;
  }
  current.count += 1;
  return current.count;
};

export const closeCache = async () => {
  if (client) {
    await client.quit().catch(() => undefined);
    client = null;
  }
  memory.clear();
  memoryCounters.clear();
};
