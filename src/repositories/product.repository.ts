import { Product } from '../types/db.types';
import { SupabaseRepository } from './supabase.repository';

export class ProductRepository extends SupabaseRepository<Product> {
  constructor() {
    // Pass the table name to the base repository
    super('products');
  }

  // Add product-specific query methods
  async findByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
    
    return data as Product[];
  }

  async findInStock(): Promise<Product[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .gt('inventory_count', 0);
    
    if (error) {
      throw new Error(`Error fetching in-stock products: ${error.message}`);
    }
    
    return data as Product[];
  }
}