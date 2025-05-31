import { Category } from '../types/db.types';
import { CategoryRepository } from '../repositories/category.repository';
import { GenericService } from './generic.service';

export class CategoryService extends GenericService<Category> {
  private categoryRepository: CategoryRepository;

  constructor() {
    const repository = new CategoryRepository();
    super(repository);
    this.categoryRepository = repository;
  }

  async getByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findByName(name);
  }
}