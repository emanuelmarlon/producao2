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

// Fallback route for SPA
// This handles any request that didn't match the API routes above
app.use((req, res, next) => {
    // If it's an API route that wasn't found, return a 404
    if (req.url.startsWith('/products') ||
        req.url.startsWith('/formulas') ||
        req.url.startsWith('/production') ||
        req.url.startsWith('/inventory') ||
        req.url.startsWith('/statistics')) {
        return res.status(404).json({ error: 'API route not found' });
    }

    // For all other routes (like /dashboard, /products, etc.), serve the SPA index.html
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('GLOBAL ERROR HANDLER:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
