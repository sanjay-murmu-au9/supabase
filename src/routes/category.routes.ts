import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { categorySchemas } from '../utils/validation.schemas';

const categoryRouter = Router();
const categoryController = new CategoryController();

// Define category routes
categoryRouter.get('/', categoryController.getAll);
categoryRouter.get('/search', categoryController.getByName);
categoryRouter.get('/:id', categoryController.getById);
categoryRouter.post('/', validateRequest(categorySchemas.create), categoryController.create);
categoryRouter.put('/:id', validateRequest(categorySchemas.update), categoryController.update);
categoryRouter.delete('/:id', categoryController.delete);

export default categoryRouter;