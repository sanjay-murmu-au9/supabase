// Database types for Supabase tables
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// Example: User model
export interface User extends BaseModel {
  email: string;
  name: string;
  mobile: number;
  is_active: boolean;
}

// Example: Product model 
export interface Product extends BaseModel {
  name: string;
  description: string;
  price: number;
  inventory_count: number;
  category_id: string;
}

// Example: Category model
export interface Category extends BaseModel {
  name: string;
  description: string;
}