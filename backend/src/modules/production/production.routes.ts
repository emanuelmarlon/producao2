import { Router } from 'express';
import { ProductionController } from './production.controller';

const productionRoutes = Router();
console.log('LOADING PRODUCTION ROUTES');
const productionController = new ProductionController();

productionRoutes.post('/', productionController.create);
productionRoutes.get('/', productionController.findAll);
productionRoutes.get('/:id', productionController.findById);
productionRoutes.patch('/:id/status', productionController.updateStatus);
productionRoutes.put('/:id', productionController.update);
productionRoutes.delete('/:id', productionController.delete);

export { productionRoutes };
