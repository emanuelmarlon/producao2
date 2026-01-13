"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const prisma_1 = require("../../lib/prisma");
class ProductsService {
    async create(data) {
        return prisma_1.prisma.product.create({
            data,
        });
    }
    async findAll() {
        return prisma_1.prisma.product.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.product.findUnique({
            where: { id },
        });
    }
    async update(id, data) {
        return prisma_1.prisma.product.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.product.delete({
            where: { id },
        });
    }
}
exports.ProductsService = ProductsService;
