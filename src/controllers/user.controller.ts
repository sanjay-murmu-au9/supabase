import { Request, Response } from 'express';
import { User } from '../types/db.types';
import { UserService } from '../services/user.service';
import { BaseController } from './base.controller';
import { DatabaseError, ValidationError } from '../middlewares/error.middleware';

export class UserController extends BaseController<User> {
  private userService: UserService;

  constructor() {
    const service = new UserService();
    super(service);
    this.userService = service;
  }

  // Override create method to add user-specific validation
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        throw new ValidationError('Email is required');
      }
      
      if (!name) {
        throw new ValidationError('Name is required');
      }
      
      // Check if email is already in use
      const existingUser = await this.userService.getByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'Email is already in use' });
        return;
      }
      
      const newUser = await this.userService.create(req.body);
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      
      if (error instanceof DatabaseError) {
        res.status(500).json({ 
          error: `Database error: ${error.message}`,
          code: error.code
        });
        return;
      }

      res.status(500).json({ 
        error: `Error creating user: ${error.message}`
      });
    }
  };

  // Add user-specific controller methods
  getByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const user = await this.userService.getByEmail(email);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json(user);
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