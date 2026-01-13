import { Request, Response } from 'express';
import { ProductionService } from './production.service';

const productionService = new ProductionService();

export class ProductionController {
    async create(req: Request, res: Response) {
        try {
            const order = await productionService.create(req.body);
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create production order' });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const orders = await productionService.findAll();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch production orders' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = await productionService.findById(id);
            if (!order) {
                return res.status(404).json({ error: 'Production order not found' });
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch production order' });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await productionService.updateStatus(id, status);
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update production order status' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = await productionService.update(id, req.body);
            res.json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update production order' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await productionService.delete(id);
            res.status(204).send();
        } catch (error: any) {
            console.error(error);
            if (error.message === 'Production order not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to delete production order' });
        }
    }
}
