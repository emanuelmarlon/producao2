import { prisma } from '../../lib/prisma';
import { Product } from '@prisma/client';

export class ProductsService {
    async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
        return prisma.product.create({
            data,
        });
    }

    async findAll() {
        return prisma.product.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string) {
        return prisma.product.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) {
        return prisma.product.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return prisma.product.delete({
            where: { id },
        });
    }
}
