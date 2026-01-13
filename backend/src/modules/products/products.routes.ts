import { Router } from 'express';
import { ProductsController } from './products.controller';
import { updateProductCost } from './update-cost.controller';

const productsRoutes = Router();
const productsController = new ProductsController();

productsRoutes.post('/', productsController.create);
productsRoutes.get('/', productsController.findAll);
productsRoutes.get('/:id', productsController.findById);
productsRoutes.put('/:id', productsController.update);
productsRoutes.delete('/:id', productsController.delete);
productsRoutes.patch('/:id/update-cost', updateProductCost);

export { productsRoutes };
