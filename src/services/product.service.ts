import { Product } from '../types/db.types';
import { ProductRepository } from '../repositories/product.repository';
import { GenericService } from './generic.service';

export class ProductService extends GenericService<Product> {
  private productRepository: ProductRepository;

  constructor() {
    const repository = new ProductRepository();
    super(repository);
    this.productRepository = repository;
  }

  async getByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.findByCategory(categoryId);
  }

  async getInStock(): Promise<Product[]> {
    return this.productRepository.findInStock();
  }
}