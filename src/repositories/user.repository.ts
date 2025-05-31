import { User } from '../types/db.types';
import { SupabaseRepository } from './supabase.repository';
import { DatabaseError } from '../middlewares/error.middleware';

export class UserRepository extends SupabaseRepository<User> {
  constructor() {
    // Pass the table name to the base repository
    super('users');
  }

  // Add user-specific query methods here
  async findByEmail(email: string): Promise<User | null> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        throw new DatabaseError(`Error fetching user by email: ${error.message}`);
      }
      
      return data as User | null;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while fetching user by email: ${error.message}`);
    }
  }

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
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
      
      return createdUser as User;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error while creating user: ${error.message}`);
    }
  }
}