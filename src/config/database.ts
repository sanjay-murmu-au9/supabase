import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import NodeCache from 'node-cache';
import { DatabaseManager } from './database.manager';
import { RedisManager } from './redis.manager';

// Export utility functions that use the DatabaseManager singleton
export const initializeDatabase = async (): Promise<void> => {
  const dbManager = DatabaseManager.getInstance();
  const redisManager = RedisManager.getInstance();
  
  await Promise.all([
    dbManager.initialize(),
    redisManager.initialize()
  ]);
};

export const getSupabaseClient = (): SupabaseClient => {
  return DatabaseManager.getInstance().getSupabaseClient();
};

export const getCache = (): Redis | NodeCache => {
  return RedisManager.getInstance().getCache();
};

export const getPgPool = (): Pool => {
  return DatabaseManager.getInstance().getPgPool();
};

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  await Promise.all([
    DatabaseManager.getInstance().cleanup(),
    RedisManager.getInstance().cleanup()
  ]);
});