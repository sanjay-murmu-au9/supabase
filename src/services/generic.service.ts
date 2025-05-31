import { BaseModel } from '../types/db.types';
import { BaseRepository } from '../repositories/base.repository';
import { BaseService } from './base.service';

export class GenericService<T extends BaseModel> implements BaseService<T> {
  constructor(protected repository: BaseRepository<T>) {}

  async getAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}