export interface Product {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    supplierCode?: string;
    dumCode?: string;
    type: 'raw_material' | 'finished' | 'packaging' | 'intermediate';
    density: number;
    netWeight?: number;
    unit: string;
    currentCost: number;
    minStock: number;
    manufacturingMode?: string;
    ph?: string;
    viscosity?: string;
    odor?: string;
    aspect?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Formula {
    id: string;
    productId: string;
    product?: Product;
    version: string;
    description?: string;
    status: 'draft' | 'approved' | 'archived';
    batchSize: number;
    items: FormulaItem[];
}

export interface FormulaItem {
    id: string;
    formulaId: string;
    ingredientId: string;
    ingredient?: Product;
    percentage: number; // Percentage of total batch (0-100)
    unit: string;
    phase: number;
    notes?: string;
}

export interface ProductionOrder {
    id: string;
    code: string;
    productId: string;
    product?: Product;
    formulaId: string;
    formula?: Formula;
    quantityPlanned: number;
    quantityReal?: number;
    unit: string;
    status: 'draft' | 'planned' | 'in_progress' | 'finished' | 'cancelled';
    startDate?: string;
    endDate?: string;
    lotNumber?: string;
    notes?: string;
    items?: ProductionOrderItem[];
}

export interface ProductionOrderItem {
    id: string;
    productionOrderId: string;
    ingredientId: string;
    ingredient?: Product;
    quantityPlanned: number;
    quantityReal?: number;
    percentage?: number;
    lotUsedId?: string;
}
