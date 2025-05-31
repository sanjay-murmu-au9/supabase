import { config } from 'dotenv';
import path from 'path';
import os from 'os';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  supabase: {
    url: string;
    anonKey: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  database: {
    poolMax: number;
    poolIdleTimeout: number;
  };
  cluster: {
    enabled: boolean;
    workers: number;
  };
  cache: {
    ttl: number;
  };
  allowedOrigins: string[] | boolean;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

// Validate required environment variables
const validateEnvVar = (name: string, value?: string): string => {
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
};

export const env: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: validateEnvVar('SUPABASE_URL', process.env.SUPABASE_URL),
    anonKey: validateEnvVar('SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  database: {
    poolMax: parseInt(process.env.PG_POOL_MAX || '20', 10),
    poolIdleTimeout: parseInt(process.env.PG_POOL_IDLE_TIMEOUT || '30000', 10),
  },
  cluster: {
    enabled: process.env.ENABLE_CLUSTERING === 'true',
    workers: parseInt(process.env.CLUSTER_WORKERS || '0', 10) || os.cpus().length,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : process.env.NODE_ENV === 'production' 
      ? false 
      : true,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};

export const validateEnvironment = (): void => {
  const { supabase, redis, database, port } = env;
  
  if (!supabase.url || !supabase.url.startsWith('https://')) {
    throw new Error('SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!supabase.anonKey || supabase.anonKey.length < 30) {
    throw new Error('SUPABASE_ANON_KEY appears to be invalid');
  }

  if (isNaN(redis.port) || redis.port <= 0 || redis.port > 65535) {
    throw new Error('REDIS_PORT must be a valid port number');
  }

  if (isNaN(database.poolMax) || database.poolMax <= 0) {
    throw new Error('PG_POOL_MAX must be a positive number');
  }

  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535');
  }
};