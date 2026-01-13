import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Product } from '../../types';

export const PurchaseEntry = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);

    const [formData, setFormData] = useState({
        productId: '',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        supplier: '',
        invoiceNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        lotCode: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            totalCost: formData.quantity * formData.unitCost,
        });
    }, [formData.quantity, formData.unitCost]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.filter((p: Product) => p.type === 'raw_material'));
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Criar lote
            const lotResponse = await api.post('/inventory/lots', {
                code: formData.lotCode || `LOT-${Date.now()}`,
                productId: formData.productId,
                quantityInitial: formData.quantity,
                status: 'active',
            });

            // Criar movimentação de entrada
            await api.post('/inventory/movements', {
                productId: formData.productId,
                lotId: lotResponse.data.id,
                type: 'in',
                quantity: formData.quantity,
                cost: formData.unitCost,
                reference: `NF: ${formData.invoiceNumber} - ${formData.supplier}`,
            });

            // Atualizar custo médio do produto
            await api.patch(`/products/${formData.productId}/update-cost`, {
                newCost: formData.unitCost,
                quantity: formData.quantity,
            });

            alert('Entrada registrada com sucesso!');
            navigate('/inventory');
        } catch (error) {
            console.error('Erro ao registrar entrada', error);
            alert('Erro ao registrar entrada. Verifique os dados.');
        }
    };

    const selectedProduct = products.find(p => p.id === formData.productId);

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Entrada de Matéria-Prima</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="text-blue-300 font-semibold mb-2">📦 Registro de Compra</h3>
                    <p className="text-sm text-gray-600">
                        Registre a entrada de matéria-prima com o custo de compra. O sistema calculará automaticamente o custo médio.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Produto (Matéria-Prima)</label>
                        <select
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        >
                            <option value="">Selecione o Produto</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                            ))}
                        </select>
                        {selectedProduct && (
                            <p className="text-xs text-gray-500 mt-1">
                                Custo médio atual: R$ {selectedProduct.currentCost?.toFixed(5)} / {selectedProduct.unit}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Código do Lote</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.lotCode}
                            onChange={(e) => setFormData({ ...formData, lotCode: e.target.value })}
                            placeholder="Deixe vazio para gerar automaticamente"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade</label>
                        <input
                            type="number"
                            step="0.001"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Custo Unitário (R$)</label>
                        <input
                            type="number"
                            step="0.00001"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.unitCost}
                            onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Custo Total (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            disabled
                            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-600 cursor-not-allowed"
                            value={formData.totalCost.toFixed(2)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fornecedor</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Número da NF</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data da Compra</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/inventory')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        💰 Registrar Entrada
                    </button>
                </div>
            </form>
        </div>
    );
};
