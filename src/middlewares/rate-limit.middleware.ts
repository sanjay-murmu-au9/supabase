import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error.middleware';
import { RedisManager } from '../config/redis.manager';
import { Redis } from 'ioredis';
import NodeCache from 'node-cache';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  keyGenerator?: (req: Request) => string;
}

async function handleRedisIncrement(redis: Redis, key: string, windowMs: number): Promise<number> {
  const [current] = await redis
    .multi()
    .incr(key)
    .expire(key, Math.ceil(windowMs / 1000))
    .exec() as [number, any];
  return current;
}

function handleNodeCacheIncrement(cache: NodeCache, key: string, windowMs: number): number {
  const current = (cache.get<number>(key) || 0) + 1;
  cache.set(key, current, Math.ceil(windowMs / 1000));
  return current;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const {
    windowMs = 60000,
    max = 100,
    keyGenerator = (req: Request) => `rate-limit:${req.ip}:${req.path}`
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cache = RedisManager.getInstance().getCache();
      const key = keyGenerator(req);
      
      let current: number;
      
      if (cache instanceof Redis) {
        current = await handleRedisIncrement(cache, key, windowMs);
      } else {
        current = handleNodeCacheIncrement(cache, key, windowMs);
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      if (current > max) {
        throw new HttpError('Too many requests', 429);
      }

      next();
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      // If cache is down, allow the request but log the error
      console.error('Rate limiter error:', error);
      next();
    }
  };
};