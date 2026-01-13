import { useEffect, useState } from 'react';
import { Search, Save, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../types';

interface StockItem {
    product: Product;
    currentStock: number;
    newQuantity: string;
    adjustment: number;
    reason: string;
}

export const StockAdjustment = () => {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, stockRes] = await Promise.all([
                api.get('/products'),
                api.get('/inventory/reports/stock-count')
            ]);



            // Initialize stock items
            const items: StockItem[] = stockRes.data.map((item: any) => ({
                product: productsRes.data.find((p: Product) => p.id === item.id) || item,
                currentStock: item.currentStock,
                newQuantity: item.currentStock.toString(),
                adjustment: 0,
                reason: ''
            }));
            setStockItems(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (index: number, value: string) => {
        const newItems = [...stockItems];
        newItems[index].newQuantity = value;
        const newQty = parseFloat(value) || 0;
        newItems[index].adjustment = newQty - newItems[index].currentStock;
        setStockItems(newItems);
    };

    const handleReasonChange = (index: number, value: string) => {
        const newItems = [...stockItems];
        newItems[index].reason = value;
        setStockItems(newItems);
    };

    const handleSaveAdjustments = async () => {
        const adjustments = stockItems.filter(item => item.adjustment !== 0 && item.reason.trim() !== '');

        if (adjustments.length === 0) {
            alert('Nenhum ajuste para salvar. Insira uma nova quantidade e um motivo.');
            return;
        }

        setSaving(true);
        try {
            for (const item of adjustments) {
                await api.post('/inventory/adjustments', {
                    productId: item.product.id,
                    quantityAdjustment: item.adjustment,
                    reason: item.reason
                });
            }
            alert(`${adjustments.length} ajuste(s) salvos com sucesso!`);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error saving adjustments:', error);
            alert('Erro ao salvar ajustes. Verifique o console.');
        } finally {
            setSaving(false);
        }
    };

    const filteredItems = stockItems.filter(item => {
        const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.product.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) return <div className="text-center p-10">Carregando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Ajuste de Estoque</h2>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw size={20} />
                        Atualizar
                    </button>
                    <button
                        onClick={handleSaveAdjustments}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Salvando...' : 'Salvar Ajustes'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-700 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou SKU..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value="raw_material">Matéria-Prima</option>
                        <option value="finished">Produto Acabado</option>
                        <option value="packaging">Embalagem</option>
                        <option value="intermediate">Intermediário</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900 text-gray-400">
                            <tr>
                                <th className="p-4">Produto</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Estoque Atual</th>
                                <th className="p-4">Nova Quantidade</th>
                                <th className="p-4">Ajuste</th>
                                <th className="p-4">Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredItems.map((item) => {
                                const originalIndex = stockItems.indexOf(item);
                                return (
                                    <tr key={item.product.id} className="hover:bg-gray-750">
                                        <td className="p-4 font-medium">{item.product.name}</td>
                                        <td className="p-4 text-sm text-gray-400">{item.product.sku || '-'}</td>
                                        <td className="p-4 text-sm">
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-700">
                                                {item.product.type === 'raw_material' ? 'MP' :
                                                    item.product.type === 'finished' ? 'PA' :
                                                        item.product.type === 'packaging' ? 'EMB' : 'INT'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono">{item.currentStock.toFixed(2)} {item.product.unit}</td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-32 bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                                                value={item.newQuantity}
                                                onChange={(e) => handleQuantityChange(originalIndex, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-mono font-bold ${item.adjustment > 0 ? 'text-green-400' : item.adjustment < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                {item.adjustment > 0 ? '+' : ''}{item.adjustment.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                placeholder="Motivo do ajuste..."
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                                                value={item.reason}
                                                onChange={(e) => handleReasonChange(originalIndex, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h3 className="font-bold text-blue-300 mb-2">Instruções:</h3>
                <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Digite a nova quantidade desejada para cada produto</li>
                    <li>• O ajuste será calculado automaticamente (diferença entre estoque atual e nova quantidade)</li>
                    <li>• Informe o motivo do ajuste (obrigatório)</li>
                    <li>• Clique em "Salvar Ajustes" para aplicar todas as mudanças</li>
                </ul>
            </div>
        </div>
    );
};
