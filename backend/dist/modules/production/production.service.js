"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionService = void 0;
const prisma_1 = require("../../lib/prisma");
class ProductionService {
    async create(data) {
        const { items, ...orderData } = data;
        // Generate unique sequential code
        const year = new Date().getFullYear();
        const latestOrder = await prisma_1.prisma.productionOrder.findFirst({
            where: {
                code: {
                    startsWith: `OP-${year}-`
                }
            },
            orderBy: {
                code: 'desc'
            }
        });
        let orderNumber = 1;
        if (latestOrder) {
            const lastNumber = parseInt(latestOrder.code.split('-')[2]);
            orderNumber = lastNumber + 1;
        }
        const code = `OP-${year}-${String(orderNumber).padStart(4, '0')}`;
        let calculatedItems = [];
        // If items are provided, use them
        if (items && items.length > 0) {
            calculatedItems = items.map(item => ({
                ingredientId: item.ingredientId,
                quantityPlanned: item.quantityPlanned,
            }));
        }
        else {
            // Fetch formula to get ingredients and percentages
            const formula = await prisma_1.prisma.formula.findUnique({
                where: { id: orderData.formulaId },
                include: { items: true }
            });
            if (!formula) {
                throw new Error('Formula not found');
            }
            // Calculate items based on formula percentages and planned quantity
            calculatedItems = formula.items.map(item => {
                const quantityPlanned = (orderData.quantityPlanned * item.percentage) / 100;
                return {
                    ingredientId: item.ingredientId,
                    quantityPlanned,
                };
            });
        }
        return prisma_1.prisma.productionOrder.create({
            data: {
                ...orderData,
                code,
                status: 'planned',
                items: {
                    create: calculatedItems,
                },
            },
            include: {
                items: {
                    include: {
                        ingredient: true
                    },
                },
                product: true,
                formula: true,
            },
        });
    }
    async findAll() {
        return prisma_1.prisma.productionOrder.findMany({
            include: {
                product: true,
                formula: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.productionOrder.findUnique({
            where: { id },
            include: {
                product: true,
                formula: true,
                items: {
                    include: {
                        ingredient: true
                    }
                },
            },
        });
    }
    async updateStatus(id, status) {
        return prisma_1.prisma.productionOrder.update({
            where: { id },
            data: { status },
        });
    }
    async update(id, data) {
        // Remove items, product, formula from data to prevent Prisma errors
        const { items, ...rest } = data;
        const { product, formula: formulaObj, id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...orderData } = rest;
        return prisma_1.prisma.$transaction(async (tx) => {
            const currentOrder = await tx.productionOrder.findUnique({
                where: { id },
                include: { items: true }
            });
            if (!currentOrder) {
                throw new Error('Production order not found');
            }
            // Prepare update data
            const updateData = {
                ...orderData,
            };
            // Handle items update
            // If items are explicitly provided, we replace them
            if (items) {
                // Delete existing items
                await tx.productionOrderItem.deleteMany({
                    where: { productionOrderId: id }
                });
                // Create new items
                updateData.items = {
                    create: items.map((item) => ({
                        ingredientId: item.ingredientId,
                        quantityPlanned: item.quantityPlanned,
                    }))
                };
            }
            // If items are NOT provided, but quantityPlanned or formulaId changed, we might need to recalculate
            // BUT, if we want to persist manual changes, we should probably ONLY recalculate if the user explicitly requests it (which would send new items)
            // OR if the formula changes completely.
            // For now, let's stick to: if items are sent, use them. If not, and formula changes, recalculate.
            else if (orderData.formulaId && orderData.formulaId !== currentOrder.formulaId) {
                const formula = await tx.formula.findUnique({
                    where: { id: orderData.formulaId },
                    include: { items: true }
                });
                if (!formula) {
                    throw new Error('Formula not found');
                }
                // Delete existing items
                await tx.productionOrderItem.deleteMany({
                    where: { productionOrderId: id }
                });
                // Calculate new items
                const quantityPlanned = orderData.quantityPlanned || currentOrder.quantityPlanned;
                const calculatedItems = formula.items.map(item => {
                    const qty = (quantityPlanned * item.percentage) / 100;
                    return {
                        ingredientId: item.ingredientId,
                        quantityPlanned: qty,
                    };
                });
                updateData.items = {
                    create: calculatedItems
                };
            }
            // If only quantityPlanned changed, we might want to scale existing items?
            // Or just leave them alone? The frontend should probably handle the scaling and send new items.
            // Let's assume frontend sends items if quantity changes to keep it simple and consistent.
            return tx.productionOrder.update({
                where: { id },
                data: updateData,
                include: {
                    items: {
                        include: {
                            ingredient: true
                        },
                    },
                    product: true,
                    formula: true,
                },
            });
        });
    }
    // Additional methods for starting, finishing (stock movements) will be added in Inventory module or here later.
    async delete(id) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // Check if order exists
            const order = await tx.productionOrder.findUnique({
                where: { id }
            });
            if (!order) {
                throw new Error('Production order not found');
            }
            // Delete related stock movements first
            await tx.stockMovement.deleteMany({
                where: { productionOrderId: id }
            });
            // Delete items first (cascade manually just in case, though relation might handle it if configured)
            await tx.productionOrderItem.deleteMany({
                where: { productionOrderId: id }
            });
            // Delete the order
            return tx.productionOrder.delete({
                where: { id }
            });
        });
    }
}
exports.ProductionService = ProductionService;
