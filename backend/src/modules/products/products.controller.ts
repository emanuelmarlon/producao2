import { Request, Response } from 'express';
import { ProductsService } from './products.service';

const productsService = new ProductsService();

export class ProductsController {
    async create(req: Request, res: Response) {
        try {
            console.log('ProductsController.create received body:', JSON.stringify(req.body, null, 2));
            // Remove id, createdAt, updatedAt from body to avoid issues with Prisma
            const { id, createdAt, updatedAt, ...data } = req.body;
            console.log('ProductsController.create processing data:', JSON.stringify(data, null, 2));
            const product = await productsService.create(data);
            res.status(201).json(product);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const products = await productsService.findAll();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productsService.findById(id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log(`ProductsController.update received for id ${id}:`, JSON.stringify(req.body, null, 2));
            // Remove id, createdAt, updatedAt from body to avoid issues with Prisma
            const { id: bodyId, createdAt, updatedAt, ...data } = req.body;
            console.log('ProductsController.update processing data:', JSON.stringify(data, null, 2));
            const product = await productsService.update(id, data);
            res.json(product);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await productsService.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
}
