import { Request, Response } from 'express';
import { BaseService } from '../services/base.service';
import { BaseModel } from '../types/db.types';

export abstract class BaseController<T extends BaseModel> {
  constructor(private service: BaseService<T>) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const items = await this.service.getAll();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      console.log('Fetching item with ID:', id);
      const item = await this.service.getById(id);
      
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ error: 'Request body is empty or invalid' });
        return;
      }
      
      const newItem = await this.service.create(req.body);
      res.status(201).json(newItem);
    } catch (error: any) {
      res.status(500).json({ 
        error: `Error creating ${this.constructor.name.replace('Controller', '')}: ${error.message}`
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const updatedItem = await this.service.update(id, req.body);
      
      if (!updatedItem) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json(updatedItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const success = await this.service.delete(id);
      
      if (!success) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}