"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulasService = void 0;
const prisma_1 = require("../../lib/prisma");
class FormulasService {
    async create(data) {
        const { items, ...formulaData } = data;
        // Sanitize items to ensure we only pass valid fields to Prisma
        const sanitizedItems = items.map((item) => ({
            ingredientId: item.ingredientId,
            percentage: item.percentage,
            unit: item.unit,
            phase: item.phase,
            notes: item.notes
        }));
        return prisma_1.prisma.formula.create({
            data: {
                ...formulaData,
                items: {
                    create: sanitizedItems,
                },
            },
            include: {
                items: {
                    include: {
                        ingredient: true,
                    },
                },
                product: true,
            },
        });
    }
    async findAll() {
        return prisma_1.prisma.formula.findMany({
            include: {
                product: true,
                items: {
                    include: {
                        ingredient: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.formula.findUnique({
            where: { id },
            include: {
                product: true,
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }
    async update(id, data) {
        const { items, ...rest } = data;
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...formulaData } = rest;
        // Transaction to handle updates safely could be better, but for now simple update
        // Updating items is complex (add/remove/update). 
        // For simplicity in this MVP, we might delete all items and recreate them if items are provided.
        if (items) {
            // Sanitize items to ensure we only pass valid fields to Prisma
            const sanitizedItems = items.map((item) => ({
                ingredientId: item.ingredientId,
                percentage: item.percentage,
                unit: item.unit,
                phase: item.phase,
                notes: item.notes
            }));
            return prisma_1.prisma.$transaction(async (tx) => {
                await tx.formulaItem.deleteMany({ where: { formulaId: id } });
                return tx.formula.update({
                    where: { id },
                    data: {
                        ...formulaData,
                        items: {
                            create: sanitizedItems,
                        },
                    },
                    include: {
                        items: { include: { ingredient: true } },
                        product: true
                    }
                });
            });
        }
        return prisma_1.prisma.formula.update({
            where: { id },
            data: formulaData,
            include: {
                items: { include: { ingredient: true } },
                product: true
            }
        });
    }
    async delete(id) {
        return prisma_1.prisma.formula.delete({
            where: { id },
        });
    }
}
exports.FormulasService = FormulasService;
