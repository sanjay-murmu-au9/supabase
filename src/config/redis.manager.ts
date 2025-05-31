import { Redis } from 'ioredis';
import NodeCache from 'node-cache';
import { env } from './environment';
import { DatabaseError } from '../middlewares/error.middleware';

export class RedisManager {
  private static instance: RedisManager;
  private redisClient: Redis | null = null;
  private memoryCache: NodeCache | null = null;

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private initializeRedis(): Redis {
    if (!this.redisClient) {
      this.redisClient = new Redis({
        host: env.redis.host,
        port: env.redis.port,
        password: env.redis.password,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('Successfully connected to Redis');
      });
    }
    return this.redisClient;
  }

  private initializeMemoryCache(): NodeCache {
    if (!this.memoryCache) {
      this.memoryCache = new NodeCache({
        stdTTL: env.cache.ttl,
        checkperiod: 60,
      });
    }
    return this.memoryCache;
  }

  public initialize(): Redis | NodeCache {
    try {
      if (env.nodeEnv === 'production') {
        return this.initializeRedis();
      } else {
        return this.initializeMemoryCache();
      }
    } catch (error: any) {
      throw new DatabaseError(`Cache initialization failed: ${error.message}`);
    }
  }

  public getCache(): Redis | NodeCache {
    const cache = env.nodeEnv === 'production' ? this.redisClient : this.memoryCache;
    if (!cache) {
      throw new DatabaseError('Cache not initialized');
    }
    return cache;
  }

  public async cleanup(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
    if (this.memoryCache) {
      this.memoryCache.close();
      this.memoryCache = null;
    }
  }
}