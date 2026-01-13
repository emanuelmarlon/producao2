import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Trash2, Plus, RefreshCw } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import Barcode from 'react-barcode';
import { api } from '../../lib/api';
import type { ProductionOrder, Product, Formula, ProductionOrderItem } from '../../types';

// Local storage helper functions


export const ProductionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [products, setProducts] = useState<Product[]>([]);
    const [formulas, setFormulas] = useState<Formula[]>([]);
    const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
    const [productionMode, setProductionMode] = useState<'weight' | 'units'>('weight');
    const [unitsToProduce, setUnitsToProduce] = useState<number>(0);

    const [formData, setFormData] = useState<Partial<ProductionOrder>>({
        code: 'Será gerado automaticamente',
        productId: '',
        formulaId: '',
        quantityPlanned: 500, // Default 500g
        unit: 'g',
        status: 'draft',
        lotNumber: '',
    });

    const [orderItems, setOrderItems] = useState<Partial<ProductionOrderItem>[]>([]);

    useEffect(() => {
        fetchProducts();
        fetchFormulas();
        if (isEdit) {
            fetchOrder();
        }
    }, [id]);

    // Auto-select formula when product changes
    useEffect(() => {
        if (formData.productId && formulas.length > 0) {
            // Find formulas for the selected product
            const productFormulas = formulas.filter(f => f.productId === formData.productId);

            if (productFormulas.length > 0) {
                // Prefer approved formulas, then most recent
                const approvedFormula = productFormulas.find(f => f.status === 'approved');
                const selectedFormula = approvedFormula || productFormulas[0];

                setFormData(prev => ({ ...prev, formulaId: selectedFormula.id }));
                setSelectedFormula(selectedFormula);

                // If not editing, clear items so they are regenerated from the new formula
                if (!isEdit) {
                    setOrderItems([]);
                }
            } else {
                setFormData(prev => ({ ...prev, formulaId: '' }));
                setSelectedFormula(null);
                setOrderItems([]);
            }
        }
    }, [formData.productId, formulas]);

    useEffect(() => {
        if (formData.formulaId) {
            const formula = formulas.find(f => f.id === formData.formulaId);
            setSelectedFormula(formula || null);

            // Initialize items from formula if not already set (or if we want to reset when formula changes)
            // Only reset if we are NOT in edit mode OR if we are in edit mode but the order items haven't been loaded yet
            // Actually, for simplicity: if we are creating a NEW order, reset items.
            // If we are EDITING, we should have loaded items from fetchOrder.
            // But if user changes formula MANUALLY, we should probably reset items.

            if (formula && !isEdit && orderItems.length === 0) {
                const newItems = formula.items.map(item => ({
                    ingredientId: item.ingredientId,
                    quantityPlanned: (formData.quantityPlanned! * item.percentage) / 100,
                    percentage: item.percentage
                }));
                setOrderItems(newItems as any);
            }
        } else {
            setSelectedFormula(null);
            if (!isEdit) setOrderItems([]);
        }
    }, [formData.formulaId, formulas]); // Removed formData.quantityPlanned to prevent resetting manual edits

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
            alert('Erro ao carregar lista de produtos.');
        }
    };

    const fetchFormulas = async () => {
        try {
            const response = await api.get('/formulas');
            setFormulas(response.data);
        } catch (error) {
            console.error('Erro ao buscar fórmulas', error);
            alert('Erro ao carregar lista de fórmulas.');
        }
    };

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/production/${id}`);
            const order = response.data;
            setFormData(order);

            // If order has items, load them
            if (order.items && order.items.length > 0) {
                // Calculate percentages based on total quantity
                const itemsWithPercentage = order.items.map((item: any) => ({
                    ...item,
                    percentage: parseFloat(((item.quantityPlanned / order.quantityPlanned) * 100).toFixed(3))
                }));
                setOrderItems(itemsWithPercentage);
            }
        } catch (error) {
            console.error('Erro ao buscar ordem', error);
            alert('Erro ao carregar ordem de produção.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if formula exists for product
        if (!formData.formulaId) {
            alert('Não há fórmula cadastrada para este produto. Por favor, cadastre uma fórmula primeiro.');
            return;
        }

        try {
            // Remove code from submission - backend will generate it
            // Also remove nested objects that might be present in edit mode (product, formula, items)
            const { code, product, formula, items, ...dataToSubmit } = formData as any;

            // Include current orderItems in the payload
            const payload = {
                ...dataToSubmit,
                items: orderItems.map(item => ({
                    ingredientId: item.ingredientId,
                    quantityPlanned: Number(item.quantityPlanned) || 0
                }))
            };

            console.log('Salvando ordem de produção:', payload);
            if (isEdit) {
                await api.put(`/production/${id}`, payload);
                console.log('✅ Ordem atualizada no Supabase');
            } else {
                await api.post('/production', payload);
                console.log('✅ Ordem criada no Supabase');
            }
            navigate('/production');
        } catch (error: any) {
            console.error('Erro ao salvar ordem', error);
            alert(`Erro ao salvar ordem de produção: ${error.response?.data?.error || error.message || 'Verifique os dados e tente novamente.'}`);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...orderItems] as any[];
        const item = newItems[index];
        const totalQuantity = formData.quantityPlanned || 0;

        // Update the edited field directly with the value (preserving strings like "0." or "")
        item[field] = value;

        // Parse value for calculation purposes
        // Use parseFloat to handle strings, default to 0 if NaN (e.g. empty string)
        const numValue = parseFloat(value);

        if (field === 'quantityPlanned') {
            // Recalculate percentage based on the new quantity
            // We only recalculate if we have a valid number
            if (!isNaN(numValue)) {
                item.percentage = totalQuantity > 0 ? parseFloat(((numValue / totalQuantity) * 100).toFixed(3)) : 0;
            }
        } else if (field === 'percentage') {
            // Recalculate quantity based on the new percentage
            if (!isNaN(numValue)) {
                item.quantityPlanned = parseFloat(((totalQuantity * numValue) / 100).toFixed(3));
            }
        }

        setOrderItems(newItems);
    };

    const handleAddIngredient = () => {
        setOrderItems([...orderItems, {
            ingredientId: '',
            quantityPlanned: 0,
            percentage: 0
        }]);
    };

    const handleRemoveIngredient = (index: number) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const handleResetIngredients = () => {
        if (!selectedFormula) return;

        if (window.confirm('Tem certeza? Isso irá substituir os ingredientes atuais pelos da fórmula original.')) {
            const newItems = selectedFormula.items.map(item => ({
                ingredientId: item.ingredientId,
                quantityPlanned: (formData.quantityPlanned! * item.percentage) / 100,
                percentage: parseFloat(item.percentage.toFixed(3))
            }));
            setOrderItems(newItems as any);
        }
    };

    // Update all items when total planned quantity changes
    useEffect(() => {
        if (orderItems.length > 0 && formData.quantityPlanned) {
            // If we change total quantity, we should probably keep percentages and update quantities?
            // Or keep quantities and update percentages?
            // Usually, scaling a batch means keeping percentages constant.
            const newItems = orderItems.map(item => ({
                ...item,
                quantityPlanned: (formData.quantityPlanned! * (item.percentage || 0)) / 100
            }));
            // Only update if values actually changed to avoid infinite loops if we were using this in dependency
            // But here we are reacting to formData.quantityPlanned change.
            // We need to be careful not to overwrite manual changes if the user just changed a single ingredient.
            // But this effect runs when TOTAL quantity changes.

            // Check if the change in quantityPlanned was triggered by us updating items? No, quantityPlanned is top level.
            // So if user changes "Quantidade Planejada", we scale all ingredients.
            setOrderItems(newItems);
        }
    }, [formData.quantityPlanned]);



    const calculateTotalWeightFromUnits = (units: number) => {
        if (!formData.productId) return;
        const product = products.find(p => p.id === formData.productId);
        if (!product || !product.netWeight) return;

        // If unit is volume (ml, L), we might need density to convert to weight (g, kg)
        // But usually formulas are in % of weight.
        // Let's assume netWeight is in the same unit as the product unit (e.g. 500ml).
        // And we want total weight in grams for the formula calculation.

        let totalWeight = units * product.netWeight;

        // If product is in L/ml, convert to grams using density
        if (['L', 'ml'].includes(product.unit) && product.density) {
            // If density is g/cm3 (same as g/ml)
            // 500ml * 1g/ml = 500g
            totalWeight = totalWeight * product.density;
        }

        // Update form data
        setFormData(prev => ({ ...prev, quantityPlanned: totalWeight, unit: 'g' }));
    };

    const handlePrintLabel = () => {
        if (!formData.productId) {
            alert('Selecione um produto para imprimir a etiqueta.');
            return;
        }

        if (!formData.lotNumber) {
            alert('Por favor, informe o número do lote para imprimir a etiqueta.');
            return;
        }

        const product = products.find(p => p.id === formData.productId);
        const dumCode = product?.dumCode || product?.barcode || 'SEM CODIGO';
        const productName = product?.name || 'PRODUTO DESCONHECIDO';
        const lot = formData.lotNumber;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Etiqueta</title>');
            printWindow.document.write('<style>');
            printWindow.document.write(`
                @page { size: 8cm 3cm; margin: 0; }
                body { margin: 0; padding: 2mm; width: 8cm; height: 3cm; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif; }
                .label-container { text-align: center; width: 100%; }
                .product-name { font-size: 10px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; margin-bottom: 2px; }
                .lot-info { font-size: 9px; margin-top: 2px; }
            `);
            printWindow.document.write('</style></head><body>');
            printWindow.document.write('<div class="label-container">');
            printWindow.document.write(`<div class="product-name">${productName}</div>`);
            printWindow.document.write('<div id="barcode-container"></div>');
            printWindow.document.write(`<div class="lot-info">Lote: ${lot}</div>`);
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            // Render barcode using React inside the new window
            const barcodeContainer = printWindow.document.getElementById('barcode-container');
            if (barcodeContainer) {
                const root = ReactDOM.createRoot(barcodeContainer);
                root.render(
                    <Barcode
                        value={dumCode}
                        width={1.5}
                        height={40}
                        fontSize={10}
                        margin={0}
                        displayValue={true}
                    />
                );

                // Wait for render then print
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{isEdit ? 'Editar Ordem' : 'Nova Ordem de Produção'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Código da Ordem *</label>
                        <input
                            type="text"
                            disabled
                            className="w-full bg-white border border-gray-600 rounded-lg px-4 py-2 text-gray-600 cursor-not-allowed"
                            value={formData.code}
                        />
                        <p className="text-xs text-gray-500 mt-1">Código será gerado automaticamente ao salvar</p>
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Lote da Produção</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.lotNumber || ''}
                                onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                                placeholder="Lote..."
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handlePrintLabel}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-[42px]"
                            title="Imprimir Etiqueta"
                        >
                            <Printer size={20} />
                            Imprimir Etiqueta
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Produto *</label>
                        <select
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        >
                            <option value="">Selecione o Produto</option>
                            {products.filter(p => p.type === 'finished' || p.type === 'intermediate').map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {formData.productId && !formData.formulaId && (
                            <p className="text-xs text-yellow-400 mt-1">⚠️ Este produto não possui fórmula cadastrada</p>
                        )}
                        {selectedFormula && (
                            <p className="text-xs text-green-400 mt-1">✓ Fórmula selecionada: {selectedFormula.product?.name || 'Produto'} (v{selectedFormula.version})</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Modo de Produção</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="productionMode"
                                        checked={productionMode === 'weight'}
                                        onChange={() => setProductionMode('weight')}
                                        className="text-blue-600"
                                    />
                                    <span>Por Peso Total</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="productionMode"
                                        checked={productionMode === 'units'}
                                        onChange={() => setProductionMode('units')}
                                        className="text-blue-600"
                                    />
                                    <span>Por Unidades</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {productionMode === 'units' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade de Unidades *</label>
                                <input
                                    type="number"
                                    step="1"
                                    required
                                    min="1"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={unitsToProduce}
                                    onChange={(e) => {
                                        const units = parseInt(e.target.value) || 0;
                                        setUnitsToProduce(units);
                                        calculateTotalWeightFromUnits(units);
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Peso Total Calculado: {formData.quantityPlanned} {formData.unit}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade Planejada *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    min="0"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={formData.quantityPlanned}
                                    onChange={(e) => setFormData({ ...formData, quantityPlanned: parseFloat(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Quantidade total a produzir</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Unidade *</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="g">g (gramas)</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="L">L</option>
                                <option value="un">un (unidades)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Status *</label>
                        <select
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="draft">Rascunho</option>
                            <option value="planned">Planejado</option>
                            <option value="in_progress">Em Andamento</option>
                            <option value="finished">Finalizado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Observações</label>
                        <textarea
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Ingredients List with Editable Quantities */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Ingredientes Necessários (Editável)</h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleResetIngredients}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                title="Recarregar ingredientes da fórmula"
                            >
                                <RefreshCw size={16} />
                                Atualizar conforme Fórmula
                            </button>
                        </div>
                    </div>
                    {selectedFormula && (
                        <p className="text-sm text-gray-600 mb-4">
                            Baseado na fórmula "{selectedFormula?.product?.name || 'Produto'} (v{selectedFormula?.version})" - Quantidade: {formData.quantityPlanned} {formData.unit}
                        </p>
                    )}

                    {orderItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mb-4">
                            Nenhum ingrediente adicionado. Adicione manualmente ou atualize conforme a fórmula.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {orderItems.map((item, index) => {
                                const ingredient = products.find(p => p.id === item.ingredientId);
                                // Find phase from formula if available
                                const formulaItem = selectedFormula?.items.find(i => i.ingredientId === item.ingredientId);
                                const phase = formulaItem?.phase || 1;

                                return (
                                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                        <div className="flex-1 mr-4">
                                            {item.ingredientId && ingredient ? (
                                                <div>
                                                    <span className="text-gray-800 font-medium">{ingredient?.name || 'Ingrediente desconhecido'}</span>
                                                    <span className="text-gray-500 text-sm ml-2">Fase {phase}</span>
                                                </div>
                                            ) : (
                                                <select
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    value={item.ingredientId}
                                                    onChange={(e) => handleItemChange(index, 'ingredientId', e.target.value)}
                                                >
                                                    <option value="">Selecione o Ingrediente</option>
                                                    {products
                                                        .filter(p => p.type === 'raw_material' || p.type === 'intermediate')
                                                        .map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))
                                                    }
                                                </select>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-right text-blue-600 font-mono focus:outline-none focus:border-blue-500"
                                                    value={item.percentage ?? ''}
                                                    onChange={(e) => handleItemChange(index, 'percentage', e.target.value)}
                                                />
                                                <span className="text-blue-600 font-mono">%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-green-600 font-mono font-bold focus:outline-none focus:border-green-500"
                                                    value={item.quantityPlanned ?? ''}
                                                    onChange={(e) => handleItemChange(index, 'quantityPlanned', e.target.value)}
                                                />
                                                <span className="text-green-600 font-mono font-bold">g</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIngredient(index)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Remover Ingrediente"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                            <Plus size={18} />
                            Adicionar Ingrediente
                        </button>
                    </div>
                    {orderItems.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-800 font-medium">Total:</span>
                                <div className="flex gap-4">
                                    <span className="text-blue-600 font-medium">
                                        {orderItems.reduce((acc, item) => acc + (parseFloat(item.percentage as any) || 0), 0).toFixed(3)}%
                                    </span>
                                    <span className="text-blue-800 font-bold">
                                        {formData.quantityPlanned} {formData.unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/production')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Salvar Ordem
                    </button>
                </div>
            </form>
        </div>
    );
};
