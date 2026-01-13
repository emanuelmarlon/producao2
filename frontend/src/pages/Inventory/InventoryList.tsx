import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../types';

interface Lot {
    id: string;
    code: string;
    productId: string;
    product?: Product;
    quantityInitial: number;
    quantityCurrent: number;
    expirationDate?: string;
    status: string;
}

export const InventoryList = () => {
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLots();
    }, []);

    const fetchLots = async () => {
        try {
            const response = await api.get('/inventory/lots');
            setLots(response.data);
        } catch (error) {
            console.error('Erro ao buscar lotes', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLots = lots.filter(lot =>
        lot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Estoque e Lotes</h2>
                    <p className="text-gray-600">Gerencie seus lotes e movimentações de estoque</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/inventory/purchase"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all"
                    >
                        <Plus size={20} />
                        Entrada de Compra
                    </Link>
                    <Link
                        to="/inventory/movements/new"
                        className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl flex items-center gap-2 border border-gray-300 shadow-sm transition-all"
                    >
                        <Plus size={20} />
                        Ajustar Estoque
                    </Link>
                    <Link
                        to="/inventory/lots/new"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
                    >
                        <Plus size={20} />
                        Novo Lote
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar lotes por código ou produto..."
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
                                <th className="p-5 font-semibold">Código do Lote</th>
                                <th className="p-5 font-semibold">Produto</th>
                                <th className="p-5 font-semibold">Qtd Atual</th>
                                <th className="p-5 font-semibold">Qtd Inicial</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold">Validade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLots.map((lot) => (
                                <tr key={lot.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5 font-medium flex items-center gap-2 text-gray-800">
                                        <Package size={16} className="text-purple-500" />
                                        {lot.code}
                                    </td>
                                    <td className="p-5 text-gray-700">{lot.product?.name}</td>
                                    <td className="p-5 font-bold text-purple-600 font-mono">{lot.quantityCurrent} {lot.product?.unit}</td>
                                    <td className="p-5 text-gray-600 font-mono">{lot.quantityInitial} {lot.product?.unit}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${lot.status === 'active' ? 'bg-green-100 text-green-700' :
                                                lot.status === 'expired' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {lot.status === 'active' ? 'ATIVO' :
                                                lot.status === 'expired' ? 'VENCIDO' : 'BLOQUEADO'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-gray-700">
                                        {lot.expirationDate ? new Date(lot.expirationDate).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredLots.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📦</div>
                                        <div className="text-lg font-medium">Nenhum lote encontrado</div>
                                        <div className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</div>
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
