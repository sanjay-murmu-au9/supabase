import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { env } from './environment';
import { DatabaseError } from '../middlewares/error.middleware';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private supabaseClient: SupabaseClient<any, 'public', any> | null = null;
  private pgPool: Pool | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async initializeSupabase(): Promise<SupabaseClient<any, 'public', any>> {
    if (!this.supabaseClient) {
      if (!env.supabase.url || !env.supabase.anonKey) {
        throw new Error('Supabase URL and anon key must be provided');
      }

      const options = {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public' as const
        }
      };

      const client = createClient(env.supabase.url, env.supabase.anonKey, options);
      
      // Test connection
      const { error } = await client
        .from('users')
        .select('id')
        .limit(1);

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      this.supabaseClient = client;
    }
    return this.supabaseClient;
  }

  private initializePgPool(): Pool {
    if (!this.pgPool) {
      this.pgPool = new Pool({
        max: env.nodeEnv === 'production' ? env.database.poolMax : 5,
        idleTimeoutMillis: env.database.poolIdleTimeout,
        connectionTimeoutMillis: 2000,
      });

      this.pgPool.on('error', (err) => {
        console.error('Unexpected PgPool error:', err);
      });
    }
    return this.pgPool;
  }

  public async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.initializeSupabase(),
        this.initializePgPool()
      ]);
      console.log('Database connections initialized successfully');
    } catch (error: any) {
      console.error('Database initialization error:', error);
      throw new DatabaseError(`Database initialization failed: ${error.message}`);
    }
  }

  public getSupabaseClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new DatabaseError('Supabase client not initialized');
    }
    return this.supabaseClient;
  }

  public getPgPool(): Pool {
    if (!this.pgPool) {
      throw new DatabaseError('PG Pool not initialized');
    }
    return this.pgPool;
  }

  public async cleanup(): Promise<void> {
    console.log('Cleaning up database connections...');
    
    if (this.pgPool) {
      await this.pgPool.end();
    }
    
    console.log('Database connections closed');
  }
}