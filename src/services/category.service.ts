import { Category } from '../types/db.types';
import { CategoryRepository } from '../repositories/category.repository';
import { GenericService } from './generic.service';

export class CategoryService extends GenericService<Category> {
  constructor(private categoryRepository: CategoryRepository) {
    super(categoryRepository);
  }

  async getByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findByName(name);
  }
}