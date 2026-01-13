import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Product } from '../../types';

// Local storage helper functions


export const LotForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);

    const [formData, setFormData] = useState({
        code: '',
        productId: '',
        quantityInitial: 0,
        expirationDate: '',
        manufactureDate: '',
        status: 'active',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
            alert('Erro ao carregar lista de produtos.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Salvando lote:', formData);
            await api.post('/inventory/lots', formData);
            console.log('✅ Lote salvo no Supabase');
            navigate('/inventory');
        } catch (error: any) {
            console.error('Erro ao criar lote', error);
            alert(`Erro ao criar lote: ${error.message || 'Verifique os dados e tente novamente.'}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Novo Lote</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Código do Lote</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Produto</label>
                        <select
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        >
                            <option value="">Selecione o Produto</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade Inicial</label>
                    <input
                        type="number"
                        step="0.001"
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.quantityInitial}
                        onChange={(e) => setFormData({ ...formData, quantityInitial: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data de Fabricação</label>
                        <input
                            type="date"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.manufactureDate}
                            onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data de Validade</label>
                        <input
                            type="date"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.expirationDate}
                            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                        />
                    </div>
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
                        Criar Lote
                    </button>
                </div>
            </form>
        </div>
    );
};
