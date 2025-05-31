import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './environment';
import { DatabaseError } from '../middlewares/error.middleware';

let supabaseInstance: SupabaseClient | null = null;

export const initializeDatabase = async (): Promise<SupabaseClient> => {
  try {
    if (!env.supabase.url || !env.supabase.anonKey) {
      throw new Error('Supabase URL and anon key must be provided in environment variables');
    }

    if (!supabaseInstance) {
      const options = {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      };

      supabaseInstance = createClient(env.supabase.url, env.supabase.anonKey, options);
      
      // Verify connection by making a simple API call
      const { data, error } = await supabaseInstance.auth.getUser();
      
      if (error && !error.message.includes('invalid claim')) {
        throw error;
      }
    }

    return supabaseInstance;
  } catch (error: any) {
    console.error('Database initialization error:', error);
    throw new DatabaseError(`Database initialization failed: ${error.message}`);
  }
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    throw new DatabaseError('Database client not initialized');
  }
  return supabaseInstance;
};

// Initialize database connection immediately
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});