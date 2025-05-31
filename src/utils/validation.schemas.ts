import Joi from 'joi';

export const userSchemas = {
    create: Joi.object({
        email: Joi.string()
            .email()
            .regex(/@(gmail\.com|yahoo\.com|outlook\.com\.in)$/)
            .required()
            .messages({
                'string.pattern.base': 'Only popular email domains like gmail.com, yahoo.com, and outlook.com are allowed.'
            }),
        name: Joi.string().min(2).max(100).required(),
        phonenumber: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
        is_active: Joi.boolean().default(true)
    }),
    update: Joi.object({
        name: Joi.string().min(2).max(100),
        is_active: Joi.boolean()
    })
};

export const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    price: Joi.number().positive().required(),
    inventory_count: Joi.number().integer().min(0).required(),
    category_id: Joi.string().uuid().required()
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500),
    price: Joi.number().positive(),
    inventory_count: Joi.number().integer().min(0),
    category_id: Joi.string().uuid()
  })
};

export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200)
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(50),
    description: Joi.string().max(200)
  })
};