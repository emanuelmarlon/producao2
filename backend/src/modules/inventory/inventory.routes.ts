import { Router } from 'express';
import { InventoryController } from './inventory.controller';

const inventoryRoutes = Router();
const inventoryController = new InventoryController();

inventoryRoutes.post('/lots', inventoryController.createLot);
inventoryRoutes.get('/lots', inventoryController.findAllLots);
inventoryRoutes.post('/movements', inventoryController.createMovement);
inventoryRoutes.get('/stock/:productId', inventoryController.getStockLevel);
inventoryRoutes.get('/reports/stock', inventoryController.getStockReport);
inventoryRoutes.get('/reports/movements', inventoryController.getMovementsHistory);
inventoryRoutes.get('/reports/low-stock', inventoryController.getLowStockProducts);
inventoryRoutes.get('/reports/expiration', inventoryController.getLotExpirationReport);
inventoryRoutes.post('/adjustments', inventoryController.createStockAdjustment);
inventoryRoutes.get('/adjustments', inventoryController.getAdjustmentHistory);
inventoryRoutes.get('/reports/stock-count', inventoryController.getStockCountReport);

export { inventoryRoutes };
