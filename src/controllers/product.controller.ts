import { Request, Response } from 'express';
import { Product } from '../types/db.types';
import { ProductService } from '../services/product.service';
import { BaseController } from './base.controller';
import { Container } from '../config/container';
import { DatabaseError } from '../middlewares/error.middleware';

export class ProductController extends BaseController<Product> {
  private productService: ProductService;

  constructor() {
    const container = Container.getInstance();
    const service = container.getService<ProductService>('ProductService');
    super(service);
    this.productService = service;
  }

  // Add product-specific controller methods
  getByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const products = await this.productService.getByCategory(categoryId);
      res.json(products);
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ 
          error: `Database error: ${error.message}`,
          code: error.code
        });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  };

  getInStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.getInStock();
      res.json(products);
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ 
          error: `Database error: ${error.message}`,
          code: error.code
        });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  };
}