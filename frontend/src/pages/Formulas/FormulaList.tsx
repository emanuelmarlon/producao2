import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Formula, Product } from '../../types';



export const FormulaList = () => {
    const [formulas, setFormulas] = useState<Formula[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchFormulas();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
        }
    };

    const fetchFormulas = async () => {
        try {
            const response = await api.get('/formulas');
            setFormulas(response.data);
        } catch (error) {
            console.error('Erro ao buscar fórmulas', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta fórmula?')) {
            try {
                await api.delete(`/formulas/${id}`);
                fetchFormulas();
            } catch (error) {
                console.error('Erro ao excluir fórmula', error);
                alert('Erro ao excluir fórmula. Tente novamente.');
            }
        }
    };

    const enrichedFormulas = formulas.map(formula => {
        if (!formula.product && formula.productId) {
            const product = products.find(p => p.id === formula.productId);
            return { ...formula, product };
        }
        return formula;
    });

    const filteredFormulas = enrichedFormulas.filter(formula =>
        (formula.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (formula.version || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Fórmulas</h2>
                    <p className="text-gray-600">Gerencie suas formulações e receitas</p>
                </div>
                <Link
                    to="/formulas/new"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
                >
                    <Plus size={20} />
                    Nova Fórmula
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar fórmulas por produto ou versão..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-semibold">Produto</th>
                                <th className="p-5 font-semibold">Versão</th>
                                <th className="p-5 font-semibold">Tamanho do Lote</th>
                                <th className="p-5 font-semibold">Ingredientes</th>
                                <th className="p-5 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFormulas.map((formula) => (
                                <tr key={formula.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5">
                                        <div className="font-semibold text-gray-800">{formula.product?.name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500 mt-1">{formula.product?.sku || ''}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                            {formula.version || 'v1.0'}
                                        </span>
                                    </td>
                                    <td className="p-5 font-mono text-gray-700">
                                        {formula.batchSize} {formula.product?.unit || 'kg'}
                                    </td>
                                    <td className="p-5 text-gray-600">
                                        {formula.items?.length || 0} ingredientes
                                    </td>
                                    <td className="p-5 flex gap-2">
                                        <Link
                                            to={`/formulas/${formula.id}`}
                                            className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(formula.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredFormulas.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">⚗️</div>
                                        <div className="text-lg font-medium">Nenhuma fórmula encontrada</div>
                                        <div className="text-sm text-gray-400 mt-1">Crie sua primeira fórmula para começar</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
