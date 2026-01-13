import { Router } from 'express';
import { StatisticsController } from './statistics.controller';

const statisticsRoutes = Router();
const statisticsController = new StatisticsController();

statisticsRoutes.get('/kpis', statisticsController.getKPIs);
statisticsRoutes.get('/production-by-month', statisticsController.getProductionByMonth);
statisticsRoutes.get('/stock-trend', statisticsController.getStockTrend);
statisticsRoutes.get('/cost-distribution', statisticsController.getCostDistribution);

export { statisticsRoutes };
