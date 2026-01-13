import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Product } from '../../types';

// Local storage helper functions


interface Lot {
    id: string;
    code: string;
    quantityCurrent: number;
}

export const StockMovementForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [lots, setLots] = useState<Lot[]>([]);

    const [formData, setFormData] = useState({
        productId: '',
        lotId: '',
        type: 'in',
        quantity: 0,
        cost: 0,
        reference: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (formData.productId) {
            fetchLots(formData.productId);
        }
    }, [formData.productId]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
            alert('Erro ao carregar lista de produtos.');
        }
    };

    const fetchLots = async (productId: string) => {
        try {
            const response = await api.get('/inventory/lots');
            const productLots = response.data.filter((l: any) => l.productId === productId);
            setLots(productLots);
        } catch (error) {
            console.error('Erro ao buscar lotes', error);
            alert('Erro ao carregar lista de lotes.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Salvando movimentação:', formData);
            await api.post('/inventory/movements', formData);
            console.log('✅ Movimentação salva no Supabase');
            navigate('/inventory');
        } catch (error: any) {
            console.error('Erro ao criar movimentação', error);
            alert(`Erro ao criar movimentação: ${error.message || 'Verifique os dados e tente novamente.'}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Movimentação de Estoque</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Produto</label>
                    <select
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value, lotId: '' })}
                    >
                        <option value="">Selecione o Produto</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Lote (Opcional)</label>
                    <select
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.lotId}
                        onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                    >
                        <option value="">Selecione o Lote</option>
                        {lots.map(l => (
                            <option key={l.id} value={l.id}>{l.code} (Qtd: {l.quantityCurrent})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
                        <select
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="in">Entrada (Compra/Retorno)</option>
                            <option value="out">Saída (Venda/Uso)</option>
                            <option value="loss">Perda (Dano/Vencimento)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade</label>
                        <input
                            type="number"
                            step="0.001"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                {formData.type === 'in' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Custo Unitário</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Referência (Nota/Invoice)</label>
                    <input
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/inventory')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Salvar Movimentação
                    </button>
                </div>
            </form>
        </div>
    );
};
