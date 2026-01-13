import { Request, Response } from 'express';
import { FormulasService } from './formulas.service';

const formulasService = new FormulasService();

export class FormulasController {
    async create(req: Request, res: Response) {
        try {
            console.log('===== CRIANDO FÓRMULA =====');
            console.log('Body recebido:', JSON.stringify(req.body, null, 2));
            const formula = await formulasService.create(req.body);
            console.log('Fórmula criada com sucesso:', formula.id);
            res.status(201).json(formula);
        } catch (error) {
            console.error('ERRO ao criar fórmula:', error);
            res.status(500).json({ error: 'Failed to create formula' });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const formulas = await formulasService.findAll();
            res.json(formulas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch formulas' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const formula = await formulasService.findById(id);
            if (!formula) {
                return res.status(404).json({ error: 'Formula not found' });
            }
            res.json(formula);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch formula' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const formula = await formulasService.update(id, req.body);
            res.json(formula);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update formula' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await formulasService.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete formula' });
        }
    }
}
