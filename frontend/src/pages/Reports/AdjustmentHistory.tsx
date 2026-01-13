import { useEffect, useState } from 'react';
import { Download, Search, Calendar } from 'lucide-react';
import { api } from '../../lib/api';

export const AdjustmentHistory = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProduct, setFilterProduct] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchHistory();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filterProduct !== 'all') params.productId = filterProduct;

            const response = await api.get('/inventory/adjustments', { params });
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching adjustment history:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Data', 'Produto', 'Estoque Anterior', 'Ajuste', 'Estoque Atual', 'Motivo'];
        const rows = filteredHistory.map(item => [
            new Date(item.date).toLocaleString('pt-BR'),
            item.product?.name || 'N/A',
            item.previousStock.toFixed(2),
            item.adjustment > 0 ? `+${item.adjustment.toFixed(2)}` : item.adjustment.toFixed(2),
            item.newStock.toFixed(2),
            item.reason
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `historico_ajustes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const totalAdjustments = filteredHistory.length;
    const positiveAdjustments = filteredHistory.filter(item => item.adjustment > 0).length;
    const negativeAdjustments = filteredHistory.filter(item => item.adjustment < 0).length;

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Histórico de Ajustes</h2>
                    <p className="text-gray-600">Registro completo de ajustes de estoque</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all"
                >
                    <Download size={20} />
                    Exportar CSV
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Total de Ajustes</div>
                    <div className="text-3xl font-bold text-purple-600">{totalAdjustments}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Ajustes Positivos</div>
                    <div className="text-3xl font-bold text-green-600">{positiveAdjustments}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Ajustes Negativos</div>
                    <div className="text-3xl font-bold text-red-600">{negativeAdjustments}</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar produto..."
                                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                        >
                            <option value="all">Todos os Produtos</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="date"
                                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="date"
                                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={fetchHistory}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-purple-500/30 transition-all"
                    >
                        Aplicar Filtros
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-semibold">Data/Hora</th>
                                <th className="p-5 font-semibold">Produto</th>
                                <th className="p-5 font-semibold">Estoque Anterior</th>
                                <th className="p-5 font-semibold">Ajuste</th>
                                <th className="p-5 font-semibold">Estoque Atual</th>
                                <th className="p-5 font-semibold">Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5 text-sm font-mono text-gray-600">
                                        {new Date(item.date).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="p-5 font-semibold text-gray-800">{item.product?.name || 'N/A'}</td>
                                    <td className="p-5 font-mono text-gray-700">{item.previousStock.toFixed(2)}</td>
                                    <td className="p-5">
                                        <span className={`font-mono font-bold ${item.adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.adjustment > 0 ? '+' : ''}{item.adjustment.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-5 font-mono font-bold text-purple-600">{item.newStock.toFixed(2)}</td>
                                    <td className="p-5 text-sm text-gray-600">{item.reason}</td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📝</div>
                                        <div className="text-lg font-medium">Nenhum ajuste encontrado</div>
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
