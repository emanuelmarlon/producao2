import { prisma } from '../../lib/prisma';
import { Formula, FormulaItem } from '@prisma/client';

interface CreateFormulaDto extends Omit<Formula, 'id' | 'createdAt' | 'updatedAt'> {
    items: Omit<FormulaItem, 'id' | 'formulaId'>[];
}

export class FormulasService {
    async create(data: CreateFormulaDto) {
        const { items, ...formulaData } = data;

        // Sanitize items to ensure we only pass valid fields to Prisma
        const sanitizedItems = items.map((item: any) => ({
            ingredientId: item.ingredientId,
            percentage: item.percentage,
            unit: item.unit,
            phase: item.phase,
            notes: item.notes
        }));

        return prisma.formula.create({
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
        return prisma.formula.findMany({
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

    async findById(id: string) {
        return prisma.formula.findUnique({
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

    async update(id: string, data: Partial<CreateFormulaDto>) {
        const { items, ...rest } = data as any;
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...formulaData } = rest;

        // Transaction to handle updates safely could be better, but for now simple update
        // Updating items is complex (add/remove/update). 
        // For simplicity in this MVP, we might delete all items and recreate them if items are provided.

        if (items) {
            // Sanitize items to ensure we only pass valid fields to Prisma
            const sanitizedItems = items.map((item: any) => ({
                ingredientId: item.ingredientId,
                percentage: item.percentage,
                unit: item.unit,
                phase: item.phase,
                notes: item.notes
            }));

            return prisma.$transaction(async (tx) => {
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

        return prisma.formula.update({
            where: { id },
            data: formulaData,
            include: {
                items: { include: { ingredient: true } },
                product: true
            }
        });
    }

    async delete(id: string) {
        return prisma.formula.delete({
            where: { id },
        });
    }
}
