"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`INCOMING REQUEST: ${req.method} ${req.url}`);
    next();
});
app.get('/', (req, res) => {
    res.json({ message: 'Cosmetic ERP API is running' });
});
const products_routes_1 = require("./modules/products/products.routes");
const formulas_routes_1 = require("./modules/formulas/formulas.routes");
const production_routes_1 = require("./modules/production/production.routes");
const inventory_routes_1 = require("./modules/inventory/inventory.routes");
const statistics_routes_1 = require("./modules/statistics/statistics.routes");
app.use('/products', products_routes_1.productsRoutes);
app.use('/formulas', formulas_routes_1.formulasRoutes);
app.use('/production', production_routes_1.productionRoutes);
app.use('/inventory', inventory_routes_1.inventoryRoutes);
app.use('/statistics', statistics_routes_1.statisticsRoutes);
// Serving Frontend static files
const frontendPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(frontendPath));
// Catch-all route for SPA
app.get('*', (req, res, next) => {
    // If it's an API route that wasn't found, let it go to 404 or error handler
    if (req.url.startsWith('/products') ||
        req.url.startsWith('/formulas') ||
        req.url.startsWith('/production') ||
        req.url.startsWith('/inventory') ||
        req.url.startsWith('/statistics')) {
        return next();
    }
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR HANDLER:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});
exports.default = app;
