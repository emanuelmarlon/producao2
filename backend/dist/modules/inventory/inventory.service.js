"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const prisma_1 = require("../../lib/prisma");
class InventoryService {
    async createLot(data) {
        return prisma_1.prisma.lot.create({
            data: {
                ...data,
                quantityCurrent: data.quantityInitial,
            },
        });
    }
    async findAllLots() {
        return prisma_1.prisma.lot.findMany({
            include: {
                product: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findLotById(id) {
        return prisma_1.prisma.lot.findUnique({
            where: { id },
            include: {
                product: true,
                stockMovements: true,
            },
        });
    }
    async createMovement(data) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // Create the movement
            const movement = await tx.stockMovement.create({
                data,
            });
            // Update lot quantity if lotId is provided
            if (data.lotId) {
                const lot = await tx.lot.findUnique({ where: { id: data.lotId } });
                if (!lot)
                    throw new Error('Lot not found');
                let newQuantity = lot.quantityCurrent;
                if (data.type === 'in' || data.type === 'production_in') {
                    newQuantity += data.quantity;
                }
                else if (data.type === 'out' || data.type === 'loss' || data.type === 'production_out') {
                    newQuantity -= data.quantity;
                }
                await tx.lot.update({
                    where: { id: data.lotId },
                    data: { quantityCurrent: newQuantity },
                });
            }
            // Update product current cost if it's an 'in' movement (simplified average cost could be implemented here)
            // For now, we just update the product cost if provided in the movement
            if ((data.type === 'in' || data.type === 'production_in') && data.cost > 0) {
                await tx.product.update({
                    where: { id: data.productId },
                    data: { currentCost: data.cost },
                });
            }
            return movement;
        });
    }
    async getStockLevel(productId) {
        const lots = await prisma_1.prisma.lot.findMany({
            where: { productId, quantityCurrent: { gt: 0 } },
        });
        const totalStock = lots.reduce((acc, lot) => acc + lot.quantityCurrent, 0);
        return { productId, totalStock, lots };
    }
    async getStockReport() {
        const products = await prisma_1.prisma.product.findMany({
            include: {
                lots: {
                    where: { quantityCurrent: { gt: 0 } }
                }
            }
        });
        return products.map(product => {
            const totalStock = product.lots.reduce((acc, lot) => acc + lot.quantityCurrent, 0);
            const totalValue = totalStock * (product.currentCost || 0);
            return {
                id: product.id,
                code: product.sku || product.barcode || '',
                name: product.name,
                unit: product.unit,
                minStock: product.minStock,
                currentStock: totalStock,
                currentCost: product.currentCost,
                totalValue,
                status: totalStock <= (product.minStock || 0) ? 'low' : 'ok'
            };
        });
    }
    async getMovementsHistory(filters) {
        const where = {};
        if (filters.startDate) {
            where.createdAt = { ...where.createdAt, gte: filters.startDate };
        }
        if (filters.endDate) {
            where.createdAt = { ...where.createdAt, lte: filters.endDate };
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.productId) {
            where.productId = filters.productId;
        }
        return prisma_1.prisma.stockMovement.findMany({
            where,
            include: {
                product: true,
                lot: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getLowStockProducts() {
        // This is a bit complex to do purely in DB query because stock is sum of lots
        // So we fetch all and filter, or we could use raw query for performance
        // For now, reusing getStockReport logic for consistency
        const report = await this.getStockReport();
        return report.filter(p => p.status === 'low');
    }
    async getLotExpirationReport(daysThreshold = 30) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
        return prisma_1.prisma.lot.findMany({
            where: {
                quantityCurrent: { gt: 0 },
                expirationDate: {
                    lte: thresholdDate
                }
            },
            include: {
                product: true
            },
            orderBy: { expirationDate: 'asc' }
        });
    }
    async createStockAdjustment(data) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // Get current stock
            const lots = await tx.lot.findMany({
                where: { productId: data.productId, quantityCurrent: { gt: 0 } }
            });
            const currentStock = lots.reduce((acc, lot) => acc + lot.quantityCurrent, 0);
            // Create adjustment movement
            const movementType = data.quantityAdjustment > 0 ? 'in' : 'out';
            const movement = await tx.stockMovement.create({
                data: {
                    productId: data.productId,
                    lotId: data.lotId,
                    type: movementType,
                    quantity: Math.abs(data.quantityAdjustment),
                    cost: 0,
                    reference: data.reason + (data.reference ? ` - ${data.reference}` : ''),
                }
            });
            // Update lot quantity if lotId provided, otherwise create/update a general lot
            if (data.lotId) {
                const lot = await tx.lot.findUnique({ where: { id: data.lotId } });
                if (!lot)
                    throw new Error('Lot not found');
                await tx.lot.update({
                    where: { id: data.lotId },
                    data: { quantityCurrent: lot.quantityCurrent + data.quantityAdjustment }
                });
            }
            else {
                // Find or create an "ADJUSTMENT" lot for this product
                let adjustmentLot = await tx.lot.findFirst({
                    where: { productId: data.productId, code: { startsWith: 'ADJ-' } }
                });
                if (!adjustmentLot) {
                    adjustmentLot = await tx.lot.create({
                        data: {
                            code: `ADJ-${data.productId.substring(0, 8)}`,
                            productId: data.productId,
                            quantityInitial: 0,
                            quantityCurrent: 0,
                            status: 'active'
                        }
                    });
                }
                await tx.lot.update({
                    where: { id: adjustmentLot.id },
                    data: {
                        quantityCurrent: adjustmentLot.quantityCurrent + data.quantityAdjustment,
                        quantityInitial: adjustmentLot.quantityInitial + (data.quantityAdjustment > 0 ? data.quantityAdjustment : 0)
                    }
                });
            }
            return {
                movement,
                previousStock: currentStock,
                adjustment: data.quantityAdjustment,
                newStock: currentStock + data.quantityAdjustment
            };
        });
    }
    async getAdjustmentHistory(filters) {
        const where = {
            reference: { contains: '' } // Adjustments have reasons in reference
        };
        if (filters.startDate) {
            where.createdAt = { ...where.createdAt, gte: filters.startDate };
        }
        if (filters.endDate) {
            where.createdAt = { ...where.createdAt, lte: filters.endDate };
        }
        if (filters.productId) {
            where.productId = filters.productId;
        }
        const movements = await prisma_1.prisma.stockMovement.findMany({
            where,
            include: {
                product: true,
                lot: true
            },
            orderBy: { createdAt: 'desc' }
        });
        // Calculate previous stock for each adjustment
        const adjustments = [];
        for (const movement of movements) {
            // Get all movements before this one for the same product
            const previousMovements = await prisma_1.prisma.stockMovement.findMany({
                where: {
                    productId: movement.productId,
                    createdAt: { lt: movement.createdAt }
                }
            });
            let previousStock = 0;
            for (const prev of previousMovements) {
                if (prev.type === 'in' || prev.type === 'production_in') {
                    previousStock += prev.quantity;
                }
                else {
                    previousStock -= prev.quantity;
                }
            }
            const adjustment = movement.type === 'in' ? movement.quantity : -movement.quantity;
            adjustments.push({
                id: movement.id,
                date: movement.createdAt,
                product: movement.product,
                previousStock,
                adjustment,
                newStock: previousStock + adjustment,
                reason: movement.reference || 'N/A',
                lot: movement.lot
            });
        }
        return adjustments;
    }
    async getStockCountReport() {
        const products = await prisma_1.prisma.product.findMany({
            include: {
                lots: {
                    where: { quantityCurrent: { gt: 0 } }
                }
            }
        });
        return products.map(product => {
            const lotDetails = product.lots.map(lot => ({
                lotCode: lot.code,
                quantity: lot.quantityCurrent,
                expirationDate: lot.expirationDate,
                status: lot.status
            }));
            const totalStock = product.lots.reduce((acc, lot) => acc + lot.quantityCurrent, 0);
            const totalValue = totalStock * (product.currentCost || 0);
            return {
                id: product.id,
                sku: product.sku,
                barcode: product.barcode,
                name: product.name,
                type: product.type,
                unit: product.unit,
                minStock: product.minStock,
                currentStock: totalStock,
                currentCost: product.currentCost,
                totalValue,
                lots: lotDetails,
                status: totalStock <= (product.minStock || 0) ? 'low' : 'ok'
            };
        });
    }
}
exports.InventoryService = InventoryService;
