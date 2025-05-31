import { User } from '../types/db.types';
import { SupabaseRepository } from './supabase.repository';
import { DatabaseError } from '../middlewares/error.middleware';
import { Redis } from 'ioredis';
import NodeCache from 'node-cache';
import { getCache } from '../config/database';

const CACHE_TTL = 300; // 5 minutes in seconds
const USER_CACHE_PREFIX = 'user:';

export class UserRepository extends SupabaseRepository<User> {
  constructor() {
    super('users');
  }

  private getCacheKey(type: string, value: string): string {
    return `${USER_CACHE_PREFIX}${type}:${value}`;
  }

  private async getCachedData(key: string): Promise<User | null> {
    const cache = getCache();
    try {
      if (cache instanceof Redis) {
        const data = await cache.get(key);
        return data ? JSON.parse(data) as User : null;
      } else {
        return cache.get<User>(key) || null;
      }
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  private async setCachedData(key: string, data: User): Promise<void> {
    const cache = getCache();
    try {
      if (cache instanceof Redis) {
        await cache.setex(key, CACHE_TTL, JSON.stringify(data));
      } else {
        cache.set(key, data, CACHE_TTL);
      }
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  private async deleteCachedData(key: string): Promise<void> {
    const cache = getCache();
    try {
      if (cache instanceof Redis) {
        await cache.del(key);
      } else {
        cache.del(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  override async findAll(): Promise<User[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Error fetching users: ${error.message}`);
      }

      return data as User[];
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while fetching users: ${error.message}`);
    }
  }

  async findAllPaginated(page: number = 1, limit: number = 100): Promise<{ users: User[]; total: number }> {
    try {
      const client = await this.getClient();
      const offset = (page - 1) * limit;

      const [{ data: users, error }, { count, error: countError }] = await Promise.all([
        client
          .from(this.tableName)
          .select('*')
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false }),
        client
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
      ]);

      if (error || countError) {
        throw new DatabaseError(`Error fetching users: ${error?.message || countError?.message}`);
      }

      return {
        users: users as User[],
        total: count || 0
      };
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while fetching users: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('email', email);
      const cachedUser = await this.getCachedData(cacheKey);
      
      if (cachedUser) {
        return cachedUser;
      }

      // If not in cache, fetch from database
      const client = await this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        throw new DatabaseError(`Error fetching user by email: ${error.message}`);
      }
      
      // Cache the result if user found
      if (data) {
        await Promise.all([
          this.setCachedData(cacheKey, data as User),
          this.setCachedData(this.getCacheKey('id', data.id), data as User)
        ]);
      }
      
      return data as User | null;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while fetching user by email: ${error.message}`);
    }
  }

  override async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      const client = await this.getClient();
      const { data: createdUser, error } = await client
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        throw new DatabaseError(`Error creating user: ${error.message}`);
      }
      
      if (!createdUser) {
        throw new DatabaseError('No data returned when creating user');
      }

      // Cache the new user
      const userCacheById = this.getCacheKey('id', createdUser.id);
      const userCacheByEmail = this.getCacheKey('email', createdUser.email);
      
      await Promise.all([
        this.setCachedData(userCacheById, createdUser as User),
        this.setCachedData(userCacheByEmail, createdUser as User)
      ]);
      
      return createdUser as User;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while creating user: ${error.message}`);
    }
  }

  override async findById(id: string): Promise<User | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('id', id);
      const cachedUser = await this.getCachedData(cacheKey);
      
      if (cachedUser) {
        return cachedUser;
      }

      // If not in cache, fetch from database
      const client = await this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError(`Error fetching user by id: ${error.message}`);
      }
      
      // Cache the result if user found
      if (data) {
        await Promise.all([
          this.setCachedData(cacheKey, data as User),
          this.setCachedData(this.getCacheKey('email', (data as User).email), data as User)
        ]);
      }
      
      return data as User | null;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while fetching user by id: ${error.message}`);
    }
  }

  override async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      const client = await this.getClient();
      const { data: updatedUser, error } = await client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new DatabaseError(`Error updating user: ${error.message}`);
      }

      if (updatedUser) {
        // Update cache
        await Promise.all([
          this.setCachedData(this.getCacheKey('id', id), updatedUser as User),
          this.setCachedData(this.getCacheKey('email', (updatedUser as User).email), updatedUser as User)
        ]);
      }

      return updatedUser as User;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while updating user: ${error.message}`);
    }
  }

  override async delete(id: string): Promise<boolean> {
    try {
      // Get user first for cache invalidation
      const user = await this.findById(id);
      if (!user) {
        return false;
      }

      const client = await this.getClient();
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new DatabaseError(`Error deleting user: ${error.message}`);
      }

      // Invalidate cache
      await Promise.all([
        this.deleteCachedData(this.getCacheKey('id', id)),
        this.deleteCachedData(this.getCacheKey('email', user.email))
      ]);

      return true;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while deleting user: ${error.message}`);
    }
  }
}
