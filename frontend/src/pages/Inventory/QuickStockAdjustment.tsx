import { useEffect, useState } from 'react';
import { Search, Save, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

interface ProductStock {
    id: string;
    name: string;
    sku: string;
    type: string;
    unit: string;
    currentStock: number;
    adjustmentValue: string;
    reason: string;
}

export const QuickStockAdjustment = () => {
    const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/reports/stock-count');
            const stocks: ProductStock[] = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                sku: item.sku || '',
                type: item.type,
                unit: item.unit,
                currentStock: item.currentStock,
                adjustmentValue: '',
                reason: ''
            }));
            setProductStocks(stocks);
        } catch (error) {
            console.error('Error fetching stock data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustmentChange = (index: number, value: string) => {
        const newStocks = [...productStocks];
        newStocks[index].adjustmentValue = value;
        setProductStocks(newStocks);
    };

    const handleReasonChange = (index: number, value: string) => {
        const newStocks = [...productStocks];
        newStocks[index].reason = value;
        setProductStocks(newStocks);
    };

    const handleSave = async () => {
        const adjustments = productStocks.filter(
            stock => stock.adjustmentValue !== '' && stock.adjustmentValue !== '0' && stock.reason.trim() !== ''
        );

        if (adjustments.length === 0) {
            alert('Nenhum ajuste para salvar. Digite um valor de ajuste e um motivo.');
            return;
        }

        setSaving(true);
        try {
            for (const stock of adjustments) {
                const adjustmentQty = parseFloat(stock.adjustmentValue);
                await api.post('/inventory/adjustments', {
                    productId: stock.id,
                    quantityAdjustment: adjustmentQty,
                    reason: stock.reason
                });
            }
            alert(`${adjustments.length} ajuste(s) salvos com sucesso!`);
            fetchStockData();
        } catch (error) {
            console.error('Error saving adjustments:', error);
            alert('Erro ao salvar ajustes.');
        } finally {
            setSaving(false);
        }
    };

    const filteredStocks = productStocks.filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Ajuste Rápido de Estoque</h2>
                    <p className="text-gray-600">Ajuste o estoque de múltiplos produtos rapidamente</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchStockData}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl flex items-center gap-2 border border-gray-300 shadow-sm hover:shadow transition-all"
                    >
                        <RefreshCw size={20} />
                        Atualizar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/30 transition-all"
                    >
                        <Save size={20} />
                        {saving ? 'Salvando...' : 'Salvar Ajustes'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produto por nome ou SKU..."
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
                                <th className="p-5 w-1/3 font-semibold">Produto</th>
                                <th className="p-5 w-24 font-semibold">SKU</th>
                                <th className="p-5 w-32 text-center font-semibold">Estoque Atual</th>
                                <th className="p-5 w-40 font-semibold">Ajuste (+/-)</th>
                                <th className="p-5 font-semibold">Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStocks.map((stock) => {
                                const originalIndex = productStocks.indexOf(stock);
                                const adjustmentNum = parseFloat(stock.adjustmentValue) || 0;
                                const newStock = stock.currentStock + adjustmentNum;

                                return (
                                    <tr key={stock.id} className="hover:bg-purple-50/50 transition-colors">
                                        <td className="p-5">
                                            <div className="font-semibold text-gray-800">{stock.name}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                                    {stock.type === 'raw_material' ? 'Matéria-Prima' :
                                                        stock.type === 'finished' ? 'Produto Acabado' :
                                                            stock.type === 'packaging' ? 'Embalagem' : 'Intermediário'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm text-gray-600 font-mono">{stock.sku || '-'}</td>
                                        <td className="p-5 text-center">
                                            <div className="font-mono font-bold text-xl text-purple-600">{stock.currentStock.toFixed(2)}</div>
                                            <div className="text-xs text-gray-500 font-medium">{stock.unit}</div>
                                        </td>
                                        <td className="p-5">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Ex: +10 ou -5"
                                                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-gray-800 text-center font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                value={stock.adjustmentValue}
                                                onChange={(e) => handleAdjustmentChange(originalIndex, e.target.value)}
                                            />
                                            {adjustmentNum !== 0 && (
                                                <div className={`text-sm mt-2 text-center font-mono font-semibold ${adjustmentNum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    → Novo: {newStock.toFixed(2)} {stock.unit}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <input
                                                type="text"
                                                placeholder="Motivo do ajuste..."
                                                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                value={stock.reason}
                                                onChange={(e) => handleReasonChange(originalIndex, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStocks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📦</div>
                                        <div className="text-lg font-medium">Nenhum produto encontrado</div>
                                        <div className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-2xl">💡</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-purple-900 mb-3 text-lg">Como usar:</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 font-bold">•</span>
                                <span>Digite o valor do ajuste (positivo para adicionar, negativo para remover)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 font-bold">•</span>
                                <span>Exemplo: <code className="bg-white px-2 py-0.5 rounded text-purple-700 font-mono">+10</code> para adicionar 10 unidades, <code className="bg-white px-2 py-0.5 rounded text-purple-700 font-mono">-5</code> para remover 5 unidades</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 font-bold">•</span>
                                <span>Informe o motivo do ajuste (obrigatório)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 font-bold">•</span>
                                <span>Clique em "Salvar Ajustes" para aplicar todas as mudanças de uma vez</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
