"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsController = void 0;
const prisma_1 = require("../../lib/prisma");
class StatisticsController {
    async getKPIs(req, res) {
        try {
            // Active orders (planned or in_progress)
            const activeOrders = await prisma_1.prisma.productionOrder.count({
                where: {
                    status: {
                        in: ['planned', 'in_progress']
                    }
                }
            });
            // Products in stock (distinct products with stock movements)
            const productsInStock = await prisma_1.prisma.product.count({
                where: {
                    type: {
                        in: ['raw_material', 'finished', 'intermediate']
                    }
                }
            });
            // Low stock items (where current quantity < min stock)
            const lowStockItems = await prisma_1.prisma.product.count({
                where: {
                    minStock: {
                        gt: 0
                    }
                    // Note: We don't have a currentStock field, so this is simplified
                }
            });
            // Pending formulas (draft status)
            const pendingFormulas = await prisma_1.prisma.formula.count({
                where: {
                    status: 'draft'
                }
            });
            res.json({
                activeOrders,
                productsInStock,
                lowStockItems,
                pendingFormulas
            });
        }
        catch (error) {
            console.error('Error fetching KPIs:', error);
            res.status(500).json({ error: 'Failed to fetch KPIs' });
        }
    }
    async getProductionByMonth(req, res) {
        try {
            // Get production orders from the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const orders = await prisma_1.prisma.productionOrder.findMany({
                where: {
                    createdAt: {
                        gte: sixMonthsAgo
                    },
                    status: {
                        in: ['finished', 'in_progress', 'planned']
                    }
                },
                select: {
                    createdAt: true,
                    quantityPlanned: true
                }
            });
            // Group by month
            const monthlyData = {};
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            orders.forEach(order => {
                const date = new Date(order.createdAt);
                const monthKey = months[date.getMonth()];
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + order.quantityPlanned;
            });
            // Convert to array format for charts
            const data = Object.entries(monthlyData).map(([name, value]) => ({
                name,
                value: Math.round(value)
            }));
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching production by month:', error);
            res.status(500).json({ error: 'Failed to fetch production data' });
        }
    }
    async getStockTrend(req, res) {
        try {
            // Get stock movements from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const movements = await prisma_1.prisma.stockMovement.findMany({
                where: {
                    createdAt: {
                        gte: sevenDaysAgo
                    }
                },
                select: {
                    createdAt: true,
                    quantity: true,
                    type: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            // Group by day
            const dailyData = {};
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            // Calculate cumulative stock
            let cumulativeStock = 100; // Starting value
            movements.forEach(movement => {
                const date = new Date(movement.createdAt);
                const dayKey = days[date.getDay()];
                // Add or subtract based on movement type
                const change = movement.type === 'in' || movement.type === 'production_in'
                    ? movement.quantity
                    : -movement.quantity;
                cumulativeStock += change;
                dailyData[dayKey] = cumulativeStock;
            });
            // Convert to array format
            const data = days.map(day => ({
                name: day,
                value: Math.round(dailyData[day] || cumulativeStock)
            }));
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching stock trend:', error);
            res.status(500).json({ error: 'Failed to fetch stock trend' });
        }
    }
    async getCostDistribution(req, res) {
        try {
            // Calculate costs based on active formulas and their ingredients
            // This is an estimation based on current stock value distribution
            // 1. Raw Materials Cost
            const rawMaterials = await prisma_1.prisma.product.findMany({
                where: { type: 'raw_material' },
                select: { currentCost: true, density: true } // Simplified
            });
            const rawMaterialCost = rawMaterials.reduce((sum, p) => sum + (p.currentCost || 0), 0);
            // 2. Packaging Cost
            const packaging = await prisma_1.prisma.product.findMany({
                where: { type: 'packaging' },
                select: { currentCost: true }
            });
            const packagingCost = packaging.reduce((sum, p) => sum + (p.currentCost || 0), 0);
            // 3. Fixed costs (simulated for now as we don't have a cost center module yet)
            // Assuming 20% overhead on materials
            const totalMaterialCost = rawMaterialCost + packagingCost;
            const laborCost = totalMaterialCost * 0.2;
            const otherCost = totalMaterialCost * 0.1;
            const total = totalMaterialCost + laborCost + otherCost;
            const data = [
                { name: 'Matéria-Prima', value: Math.round((rawMaterialCost / total) * 100) || 0 },
                { name: 'Embalagem', value: Math.round((packagingCost / total) * 100) || 0 },
                { name: 'Mão de Obra', value: Math.round((laborCost / total) * 100) || 0 },
                { name: 'Outros', value: Math.round((otherCost / total) * 100) || 0 },
            ];
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching cost distribution:', error);
            res.status(500).json({ error: 'Failed to fetch cost distribution' });
        }
    }
}
exports.StatisticsController = StatisticsController;
