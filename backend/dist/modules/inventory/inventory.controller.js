"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("./inventory.service");
const inventoryService = new inventory_service_1.InventoryService();
class InventoryController {
    async createLot(req, res) {
        try {
            const lot = await inventoryService.createLot(req.body);
            res.status(201).json(lot);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create lot' });
        }
    }
    async findAllLots(req, res) {
        try {
            const lots = await inventoryService.findAllLots();
            res.json(lots);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch lots' });
        }
    }
    async createMovement(req, res) {
        try {
            const movement = await inventoryService.createMovement(req.body);
            res.status(201).json(movement);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create stock movement' });
        }
    }
    async getStockLevel(req, res) {
        try {
            const { productId } = req.params;
            const stock = await inventoryService.getStockLevel(productId);
            res.json(stock);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch stock level' });
        }
    }
    async getStockReport(req, res) {
        try {
            const report = await inventoryService.getStockReport();
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch stock report' });
        }
    }
    async getMovementsHistory(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch movements history' });
        }
    }
    async getLowStockProducts(req, res) {
        try {
            const products = await inventoryService.getLowStockProducts();
            res.json(products);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch low stock products' });
        }
    }
    async getLotExpirationReport(req, res) {
        try {
            const { days } = req.query;
            const daysThreshold = days ? parseInt(String(days)) : 30;
            const lots = await inventoryService.getLotExpirationReport(daysThreshold);
            res.json(lots);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch expiration report' });
        }
    }
    async createStockAdjustment(req, res) {
        try {
            const result = await inventoryService.createStockAdjustment(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create stock adjustment' });
        }
    }
    async getAdjustmentHistory(req, res) {
        try {
            const { startDate, endDate, productId } = req.query;
            const filters = {
                startDate: startDate ? new Date(String(startDate)) : undefined,
                endDate: endDate ? new Date(String(endDate)) : undefined,
                productId: productId ? String(productId) : undefined
            };
            const history = await inventoryService.getAdjustmentHistory(filters);
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch adjustment history' });
        }
    }
    async getStockCountReport(req, res) {
        try {
            const report = await inventoryService.getStockCountReport();
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch stock count report' });
        }
    }
}
exports.InventoryController = InventoryController;
