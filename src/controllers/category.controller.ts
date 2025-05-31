import { Request, Response } from 'express';
import { Category } from '../types/db.types';
import { CategoryService } from '../services/category.service';
import { BaseController } from './base.controller';

export class CategoryController extends BaseController<Category> {
  private categoryService: CategoryService;

  constructor() {
    const service = new CategoryService();
    super(service);
    this.categoryService = service;
  }

  // Add category-specific controller methods
  getByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.query;
      
      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Name parameter is required' });
        return;
      }
      
      const category = await this.categoryService.getByName(name);
      
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}