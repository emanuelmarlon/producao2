"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const products_service_1 = require("./products.service");
const productsService = new products_service_1.ProductsService();
class ProductsController {
    async create(req, res) {
        try {
            console.log('ProductsController.create received body:', JSON.stringify(req.body, null, 2));
            // Remove id, createdAt, updatedAt from body to avoid issues with Prisma
            const { id, createdAt, updatedAt, ...data } = req.body;
            console.log('ProductsController.create processing data:', JSON.stringify(data, null, 2));
            const product = await productsService.create(data);
            res.status(201).json(product);
        }
        catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    }
    async findAll(req, res) {
        try {
            const products = await productsService.findAll();
            res.json(products);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const product = await productsService.findById(id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            console.log(`ProductsController.update received for id ${id}:`, JSON.stringify(req.body, null, 2));
            // Remove id, createdAt, updatedAt from body to avoid issues with Prisma
            const { id: bodyId, createdAt, updatedAt, ...data } = req.body;
            console.log('ProductsController.update processing data:', JSON.stringify(data, null, 2));
            const product = await productsService.update(id, data);
            res.json(product);
        }
        catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await productsService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
}
exports.ProductsController = ProductsController;
