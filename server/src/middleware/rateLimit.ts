import type { RequestHandler } from 'express';
import { ApiError } from '../utils/errors.js';
import { cacheIncrement } from '../services/cache.js';

type RateLimitOptions = {
  scope: string;
  windowMs?: number;
  max?: number;
};

export const rateLimit =
  ({ scope, windowMs = 60_000, max = 60 }: RateLimitOptions): RequestHandler =>
  async (req, _res, next) => {
    try {
      const key = `ratelimit:${scope}:${req.ip || 'unknown'}`;
      const count = await cacheIncrement(key, windowMs);
      if (count > max) {
        return next(
          new ApiError(429, 'rate_limited', 'Too many requests, please try again later', {
            retryAfterMs: windowMs,
          }),
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
