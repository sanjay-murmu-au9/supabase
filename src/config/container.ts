import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { UserRepository } from '../repositories/user.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';

export class Container {
  private static instance: Container;
  private services: Map<string, any>;
  private repositories: Map<string, any>;

  private constructor() {
    this.services = new Map();
    this.repositories = new Map();
    this.registerDependencies();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerDependencies(): void {
    // Register repositories
    this.repositories.set('UserRepository', new UserRepository());
    this.repositories.set('ProductRepository', new ProductRepository());
    this.repositories.set('CategoryRepository', new CategoryRepository());

    // Register services with their dependencies
    this.services.set('UserService', new UserService(this.repositories.get('UserRepository')));
    this.services.set('ProductService', new ProductService(this.repositories.get('ProductRepository')));
    this.services.set('CategoryService', new CategoryService(this.repositories.get('CategoryRepository')));
  }

  public getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }

  public getRepository<T>(repositoryName: string): T {
    const repository = this.repositories.get(repositoryName);
    if (!repository) {
      throw new Error(`Repository ${repositoryName} not found in container`);
    }
    return repository as T;
  }
}