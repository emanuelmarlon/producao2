import { Router } from 'express';
import { FormulasController } from './formulas.controller';

const formulasRoutes = Router();
const formulasController = new FormulasController();

formulasRoutes.post('/', formulasController.create);
formulasRoutes.get('/', formulasController.findAll);
formulasRoutes.get('/:id', formulasController.findById);
formulasRoutes.put('/:id', formulasController.update);
formulasRoutes.delete('/:id', formulasController.delete);

export { formulasRoutes };
