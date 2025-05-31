import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  supabase: {
    url: string;
    anonKey: string;
  };
  allowedOrigins: string[] | boolean;
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
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : process.env.NODE_ENV === 'production' 
      ? false 
      : true,
};

export const validateEnvironment = (): void => {
  const { supabase } = env;
  
  if (!supabase.url || !supabase.url.startsWith('https://')) {
    throw new Error('SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!supabase.anonKey || supabase.anonKey.length < 30) {
    throw new Error('SUPABASE_ANON_KEY appears to be invalid');
  }

  // Validate port number
  if (isNaN(env.port) || env.port <= 0 || env.port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535');
  }
};