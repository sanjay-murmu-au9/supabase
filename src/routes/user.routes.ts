import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { userSchemas } from '../utils/validation.schemas';

const userRouter = Router();
const userController = new UserController();

// Define user routes - order matters for Express route matching
userRouter.get('/', userController.getAll);
userRouter.post('/', validateRequest(userSchemas.create), userController.create);
userRouter.get('/email/:email', userController.getByEmail);  // Specific routes before parameter routes
userRouter.get('/:id', userController.getById);
userRouter.put('/:id', validateRequest(userSchemas.update), userController.update);
userRouter.delete('/:id', userController.delete);

export default userRouter;