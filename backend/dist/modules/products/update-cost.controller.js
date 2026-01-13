"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductCost = void 0;
const prisma_1 = require("../../lib/prisma");
const updateProductCost = async (req, res) => {
    try {
        const { id } = req.params;
        const { newCost, quantity } = req.body;
        // Buscar produto atual
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        // Buscar quantidade total em estoque
        const lots = await prisma_1.prisma.lot.findMany({
            where: { productId: id, status: 'active' },
        });
        const totalStock = lots.reduce((sum, lot) => sum + lot.quantityCurrent, 0);
        // Calcular custo médio ponderado
        // Fórmula: (Custo Atual * Estoque Atual + Novo Custo * Nova Quantidade) / (Estoque Atual + Nova Quantidade)
        const currentValue = product.currentCost * totalStock;
        const newValue = newCost * quantity;
        const totalQuantity = totalStock + quantity;
        const averageCost = totalQuantity > 0 ? (currentValue + newValue) / totalQuantity : newCost;
        // Atualizar custo do produto
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                currentCost: averageCost,
            },
        });
        res.json({
            ...updatedProduct,
            previousCost: product.currentCost,
            newAverageCost: averageCost,
            calculation: {
                previousStock: totalStock,
                newQuantity: quantity,
                totalStock: totalQuantity,
                previousValue: currentValue,
                newValue: newValue,
                totalValue: currentValue + newValue,
            },
        });
    }
    catch (error) {
        console.error('Erro ao atualizar custo:', error);
        res.status(500).json({ error: 'Erro ao atualizar custo do produto' });
    }
};
exports.updateProductCost = updateProductCost;
