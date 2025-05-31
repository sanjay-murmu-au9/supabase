import { Router } from 'express';
import userRouter from './user.routes';
import productRouter from './product.routes';
import categoryRouter from './category.routes';

const router = Router();

// Mount route groups
router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/categories', categoryRouter);

export default router;