import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { productSchemas } from '../utils/validation.schemas';

const productRouter = Router();
const productController = new ProductController();

// Define product routes
productRouter.get('/', productController.getAll);
productRouter.get('/in-stock', productController.getInStock);
productRouter.get('/category/:categoryId', productController.getByCategory);
productRouter.get('/:id', productController.getById);
productRouter.post('/', validateRequest(productSchemas.create), productController.create);
productRouter.put('/:id', validateRequest(productSchemas.update), productController.update);
productRouter.delete('/:id', productController.delete);

export default productRouter;