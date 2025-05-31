import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../types/db.types';
import { BaseRepository } from './base.repository';
import { getSupabaseClient } from '../config/database';
import { DatabaseError } from '../middlewares/error.middleware';

export class SupabaseRepository<T extends BaseModel> implements BaseRepository<T> {
  protected readonly tableName: string;
  protected client: SupabaseClient | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async getClient(): Promise<SupabaseClient> {
    if (!this.client) {
      try {
        this.client = getSupabaseClient();
      } catch (error) {
        throw new DatabaseError(`Failed to get database client: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    return this.client;
  }

  async findAll(): Promise<T[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*');
      
      if (error) {
        throw new DatabaseError(`Error fetching ${this.tableName}: ${error.message}`);
      }
      
      return data as T[];
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error in findAll: ${error.message}`);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DatabaseError(`Error fetching ${this.tableName} with id ${id}: ${error.message}`);
      }
      
      return data as T;
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error in findById: ${error.message}`);
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const client = await this.getClient();
      const { data: createdItem, error } = await client
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        throw new DatabaseError(`Error creating ${this.tableName}: ${error.message}`);
      }
      
      if (!createdItem) {
        throw new DatabaseError(`No data returned when creating ${this.tableName}`);
      }
      
      return createdItem as T;
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error in create: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const client = await this.getClient();
      const { data: updatedItem, error } = await client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new DatabaseError(`Error updating ${this.tableName} with id ${id}: ${error.message}`);
      }
      
      return updatedItem as T;
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error in update: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new DatabaseError(`Error deleting ${this.tableName} with id ${id}: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error in delete: ${error.message}`);
    }
  }
}