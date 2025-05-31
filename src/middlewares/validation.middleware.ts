import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './error.middleware';
import { Schema } from 'joi';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new ValidationError(errors.join(', '));
    }

    next();
  };
};