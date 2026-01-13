import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Download, Search } from 'lucide-react';

interface StockReportItem {
    id: string;
    code: string;
    name: string;
    unit: string;
    minStock: number;
    currentStock: number;
    currentCost: number;
    totalValue: number;
    status: 'low' | 'ok';
}

export const StockReport = () => {
    const [data, setData] = useState<StockReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const response = await api.get('/inventory/reports/stock');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao buscar relatório', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockValue = filteredData.reduce((acc, item) => acc + item.totalValue, 0);

    const handleExport = () => {
        const csvContent = [
            ['Código', 'Produto', 'Unidade', 'Estoque Atual', 'Estoque Mínimo', 'Custo Unit.', 'Valor Total', 'Status'],
            ...filteredData.map(item => [
                item.code,
                item.name,
                item.unit,
                item.currentStock,
                item.minStock,
                item.currentCost,
                item.totalValue,
                item.status === 'low' ? 'BAIXO' : 'OK'
            ])
        ].map(e => e.join(';')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'relatorio_estoque.csv';
        link.click();
    };

    if (loading) return <div className="p-8 text-center text-gray-600">Carregando relatório...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Posição de Estoque</h2>
                    <p className="text-gray-600">Relatório detalhado de estoque</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all"
                >
                    <Download size={20} />
                    Exportar CSV
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl mb-6">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produto..."
                            className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 font-medium">Valor Total em Estoque</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalStockValue)}
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-semibold">Código</th>
                                <th className="p-5 font-semibold">Produto</th>
                                <th className="p-5 text-right font-semibold">Estoque Atual</th>
                                <th className="p-5 text-right font-semibold">Estoque Mín.</th>
                                <th className="p-5 text-right font-semibold">Custo Unit.</th>
                                <th className="p-5 text-right font-semibold">Valor Total</th>
                                <th className="p-5 text-center font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5 font-mono text-sm text-gray-600">{item.code}</td>
                                    <td className="p-5 font-semibold text-gray-800">{item.name}</td>
                                    <td className="p-5 text-right font-bold text-purple-600">
                                        {item.currentStock} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                    </td>
                                    <td className="p-5 text-right text-gray-600">{item.minStock}</td>
                                    <td className="p-5 text-right text-gray-700 font-mono">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.currentCost)}
                                    </td>
                                    <td className="p-5 text-right font-semibold text-green-600 font-mono">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalValue)}
                                    </td>
                                    <td className="p-5 text-center">
                                        {item.status === 'low' ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                BAIXO
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                OK
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📊</div>
                                        <div className="text-lg font-medium">Nenhum dado encontrado</div>
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
