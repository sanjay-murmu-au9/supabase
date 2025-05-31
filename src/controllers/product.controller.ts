import { Request, Response } from 'express';
import { Product } from '../types/db.types';
import { ProductService } from '../services/product.service';
import { BaseController } from './base.controller';

export class ProductController extends BaseController<Product> {
  private productService: ProductService;

  constructor() {
    const service = new ProductService();
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
      res.status(500).json({ error: error.message });
    }
  };

  getInStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.getInStock();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}