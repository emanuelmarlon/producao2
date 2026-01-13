
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProductList } from './pages/Products/ProductList';
import { ProductForm } from './pages/Products/ProductForm';
import { FormulaList } from './pages/Formulas/FormulaList';
import { FormulaForm } from './pages/Formulas/FormulaForm';
import { ProductionList } from './pages/Production/ProductionList';
import { ProductionForm } from './pages/Production/ProductionForm';
import { ProductionOrderReport } from './pages/Production/ProductionOrderReport';

import { InventoryList } from './pages/Inventory/InventoryList';
import { StockMovementForm } from './pages/Inventory/StockMovementForm';
import { LotForm } from './pages/Inventory/LotForm';
import { PurchaseEntry } from './pages/Inventory/PurchaseEntry';
import { StockAdjustment } from './pages/Inventory/StockAdjustment';
import { QuickStockAdjustment } from './pages/Inventory/QuickStockAdjustment';
import { Reports } from './pages/Reports/Reports';
import { StockReport } from './pages/Reports/StockReport';
import { MovementHistory } from './pages/Reports/MovementHistory';
import { StockCountReport } from './pages/Reports/StockCountReport';
import { AdjustmentHistory } from './pages/Reports/AdjustmentHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="formulas" element={<FormulaList />} />
          <Route path="formulas/new" element={<FormulaForm />} />
          <Route path="formulas/:id" element={<FormulaForm />} />
          <Route path="production" element={<ProductionList />} />
          <Route path="production/new" element={<ProductionForm />} />
          <Route path="production/:id" element={<ProductionForm />} />
          <Route path="production/:id/report" element={<ProductionOrderReport />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/purchase" element={<PurchaseEntry />} />
          <Route path="inventory/movements/new" element={<StockMovementForm />} />
          <Route path="inventory/lots/new" element={<LotForm />} />
          <Route path="inventory/adjustment" element={<StockAdjustment />} />
          <Route path="inventory/quick-adjustment" element={<QuickStockAdjustment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/stock" element={<StockReport />} />
          <Route path="reports/movements" element={<MovementHistory />} />
          <Route path="reports/stock-count" element={<StockCountReport />} />
          <Route path="reports/adjustments" element={<AdjustmentHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
