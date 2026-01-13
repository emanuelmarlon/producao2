import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`INCOMING REQUEST: ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Cosmetic ERP API is running' });
});

import { productsRoutes } from './modules/products/products.routes';
import { formulasRoutes } from './modules/formulas/formulas.routes';
import { productionRoutes } from './modules/production/production.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { statisticsRoutes } from './modules/statistics/statistics.routes';

app.use('/products', productsRoutes);
app.use('/formulas', formulasRoutes);


app.use('/production', productionRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/statistics', statisticsRoutes);

// Serving Frontend static files
const frontendPath = path.join(__dirname, '../public');
app.use(express.static(frontendPath));

// Catch-all route for SPA
app.get('/:path*', (req, res, next) => {
    // If it's an API route that wasn't found, let it go to 404 or error handler
    if (req.url.startsWith('/products') ||
        req.url.startsWith('/formulas') ||
        req.url.startsWith('/production') ||
        req.url.startsWith('/inventory') ||
        req.url.startsWith('/statistics')) {
        return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('GLOBAL ERROR HANDLER:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
