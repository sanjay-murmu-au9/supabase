import { Category } from '../types/db.types';
import { SupabaseRepository } from './supabase.repository';

export class CategoryRepository extends SupabaseRepository<Category> {
  constructor() {
    // Pass the table name to the base repository
    super('categories');
  }

  // Add category-specific query methods
  async findByName(name: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .ilike('name', `%${name}%`)
      .maybeSingle();
    
    if (error) {
      throw new Error(`Error fetching category by name: ${error.message}`);
    }
    
    return data as Category;
  }
}