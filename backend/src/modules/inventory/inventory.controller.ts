import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';

const inventoryService = new InventoryService();

export class InventoryController {
    async createLot(req: Request, res: Response) {
        try {
            const lot = await inventoryService.createLot(req.body);
            res.status(201).json(lot);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create lot' });
        }
    }

    async findAllLots(req: Request, res: Response) {
        try {
            const lots = await inventoryService.findAllLots();
            res.json(lots);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch lots' });
        }
    }

    async createMovement(req: Request, res: Response) {
        try {
            const movement = await inventoryService.createMovement(req.body);
            res.status(201).json(movement);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create stock movement' });
        }
    }

    async getStockLevel(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const stock = await inventoryService.getStockLevel(productId);
            res.json(stock);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch stock level' });
        }
    }

    async getStockReport(req: Request, res: Response) {
        try {
            const report = await inventoryService.getStockReport();
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch stock report' });
        }
    }

    async getMovementsHistory(req: Request, res: Response) {
        try {
            const { startDate, endDate, type, productId } = req.query;
            const filters = {
                startDate: startDate ? new Date(String(startDate)) : undefined,
                endDate: endDate ? new Date(String(endDate)) : undefined,
                type: type ? String(type) : undefined,
                productId: productId ? String(productId) : undefined
            };
            const history = await inventoryService.getMovementsHistory(filters);
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch movements history' });
        }
    }

    async getLowStockProducts(req: Request, res: Response) {
        try {
            const products = await inventoryService.getLowStockProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch low stock products' });
        }
    }

    async getLotExpirationReport(req: Request, res: Response) {
        try {
            const { days } = req.query;
            const daysThreshold = days ? parseInt(String(days)) : 30;
            const lots = await inventoryService.getLotExpirationReport(daysThreshold);
            res.json(lots);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch expiration report' });
        }
    }

    async createStockAdjustment(req: Request, res: Response) {
        try {
            const result = await inventoryService.createStockAdjustment(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create stock adjustment' });
        }
    }

    async getAdjustmentHistory(req: Request, res: Response) {
        try {
            const { startDate, endDate, productId } = req.query;
            const filters = {
                startDate: startDate ? new Date(String(startDate)) : undefined,
                endDate: endDate ? new Date(String(endDate)) : undefined,
                productId: productId ? String(productId) : undefined
            };
            const history = await inventoryService.getAdjustmentHistory(filters);
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch adjustment history' });
        }
    }

    async getStockCountReport(req: Request, res: Response) {
        try {
            const report = await inventoryService.getStockCountReport();
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch stock count report' });
        }
    }
}
