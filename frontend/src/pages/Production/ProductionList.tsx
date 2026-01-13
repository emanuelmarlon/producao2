import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Play, CheckCircle, Trash2, Printer } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProductionOrder, Product } from '../../types';



export const ProductionList = () => {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/production');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar ordens de produção', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(`/production/${id}/status`, { status });
            fetchOrders();
        } catch (error) {
            console.error('Erro ao atualizar status', error);
            alert('Erro ao atualizar status. Tente novamente.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta ordem de produção?')) {
            try {
                await api.delete(`/production/${id}`);
                fetchOrders();
            } catch (error) {
                console.error('Erro ao excluir ordem', error);
                alert('Erro ao excluir ordem. Tente novamente.');
            }
        }
    };

    const enrichedOrders = orders.map(order => {
        if (!order.product && order.productId) {
            const product = products.find(p => p.id === order.productId);
            return { ...order, product };
        }
        return order;
    });

    const filteredOrders = enrichedOrders.filter(order =>
        order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Ordens de Produção</h2>
                    <p className="text-gray-600">Gerencie suas ordens de produção</p>
                </div>
                <Link
                    to="/production/new"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
                >
                    <Plus size={20} />
                    Nova Ordem
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por código ou produto..."
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
                                <th className="p-5 font-semibold">Código</th>
                                <th className="p-5 font-semibold">Produto</th>
                                <th className="p-5 font-semibold">Qtd Planejada</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5 font-medium font-mono text-sm text-gray-800">{order.code}</td>
                                    <td className="p-5 text-gray-700">{order.product?.name || 'Produto não encontrado'}</td>
                                    <td className="p-5 font-mono text-gray-700">{order.quantityPlanned} {order.unit}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'finished' ? 'bg-green-100 text-green-700' :
                                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status === 'finished' ? 'Finalizado' :
                                                order.status === 'in_progress' ? 'Em Andamento' :
                                                    order.status === 'planned' ? 'Planejado' :
                                                        order.status === 'cancelled' ? 'Cancelado' : 'Rascunho'}
                                        </span>
                                    </td>
                                    <td className="p-5 flex gap-2">
                                        <Link
                                            to={`/production/${order.id}`}
                                            className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <Link
                                            to={`/production/${order.id}/report`}
                                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                            title="Imprimir Relatório"
                                        >
                                            <Printer size={18} />
                                        </Link>
                                        {order.status === 'planned' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                                                className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                                                title="Iniciar Produção"
                                            >
                                                <Play size={18} />
                                            </button>
                                        )}
                                        {order.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'finished')}
                                                className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                                title="Finalizar Produção"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                            title="Excluir Ordem"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📋</div>
                                        <div className="text-lg font-medium">Nenhuma ordem encontrada</div>
                                        <div className="text-sm text-gray-400 mt-1">Crie sua primeira ordem de produção</div>
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
