import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { api } from '../../lib/api';

export const StockCountReport = () => {
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/reports/stock-count');
            setReport(response.data);
        } catch (error) {
            console.error('Error fetching stock count report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['SKU', 'Nome', 'Tipo', 'Unidade', 'Estoque Atual', 'Estoque Mínimo', 'Custo Unitário', 'Valor Total', 'Status'];
        const rows = filteredReport.map(item => [
            item.sku || '',
            item.name,
            item.type,
            item.unit,
            item.currentStock.toFixed(2),
            item.minStock.toFixed(2),
            item.currentCost.toFixed(2),
            item.totalValue.toFixed(2),
            item.status === 'low' ? 'Baixo' : 'OK'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contagem_estoque_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredReport = report.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const totalValue = filteredReport.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = filteredReport.filter(item => item.status === 'low').length;

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Contagem de Estoque</h2>
                    <p className="text-gray-600">Relatório completo de contagem</p>
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
                    <div className="text-sm text-gray-600 font-medium mb-2">Total de Produtos</div>
                    <div className="text-3xl font-bold text-purple-600">{filteredReport.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Valor Total do Estoque</div>
                    <div className="text-3xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Produtos com Estoque Baixo</div>
                    <div className="text-3xl font-bold text-yellow-600">{lowStockCount}</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou SKU..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value="raw_material">Matéria-Prima</option>
                        <option value="finished">Produto Acabado</option>
                        <option value="packaging">Embalagem</option>
                        <option value="intermediate">Intermediário</option>
                    </select>
                    <select
                        className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="ok">OK</option>
                        <option value="low">Estoque Baixo</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-semibold">SKU</th>
                                <th className="p-5 font-semibold">Produto</th>
                                <th className="p-5 font-semibold">Tipo</th>
                                <th className="p-5 font-semibold">Estoque Atual</th>
                                <th className="p-5 font-semibold">Estoque Mín.</th>
                                <th className="p-5 font-semibold">Custo Unit.</th>
                                <th className="p-5 font-semibold">Valor Total</th>
                                <th className="p-5 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReport.map((item) => (
                                <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5 text-sm text-gray-600 font-mono">{item.sku || '-'}</td>
                                    <td className="p-5 font-semibold text-gray-800">{item.name}</td>
                                    <td className="p-5 text-sm">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            {item.type === 'raw_material' ? 'Matéria-Prima' :
                                                item.type === 'finished' ? 'Produto Acabado' :
                                                    item.type === 'packaging' ? 'Embalagem' : 'Intermediário'}
                                        </span>
                                    </td>
                                    <td className="p-5 font-mono text-purple-600 font-bold">{item.currentStock.toFixed(2)} {item.unit}</td>
                                    <td className="p-5 font-mono text-gray-600">{item.minStock.toFixed(2)} {item.unit}</td>
                                    <td className="p-5 font-mono text-gray-700">R$ {item.currentCost.toFixed(2)}</td>
                                    <td className="p-5 font-mono font-bold text-green-600">R$ {item.totalValue.toFixed(2)}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'low' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {item.status === 'low' ? 'Baixo' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredReport.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📊</div>
                                        <div className="text-lg font-medium">Nenhum produto encontrado</div>
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
