import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Movement {
    id: string;
    type: string;
    quantity: number;
    createdAt: string;
    product: {
        name: string;
        unit: string;
    };
    lot?: {
        code: string;
    };
}

export const MovementHistory = () => {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        type: ''
    });

    useEffect(() => {
        fetchMovements();
    }, [filters]);

    const fetchMovements = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.type) params.append('type', filters.type);

            const response = await api.get(`/inventory/reports/movements?${params.toString()}`);
            setMovements(response.data);
        } catch (error) {
            console.error('Erro ao buscar movimentações', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'in': return 'Entrada';
            case 'out': return 'Saída';
            case 'production_in': return 'Produção (Entrada)';
            case 'production_out': return 'Produção (Consumo)';
            case 'loss': return 'Perda';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'in':
            case 'production_in':
                return 'text-green-600';
            case 'out':
            case 'production_out':
            case 'loss':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Histórico de Movimentações</h2>

            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Data Início</label>
                        <input
                            type="date"
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Data Fim</label>
                        <input
                            type="date"
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">Todos</option>
                            <option value="in">Entrada</option>
                            <option value="out">Saída</option>
                            <option value="production_in">Produção (Entrada)</option>
                            <option value="production_out">Produção (Consumo)</option>
                            <option value="loss">Perda</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold">Data/Hora</th>
                            <th className="p-4 font-semibold">Produto</th>
                            <th className="p-4 font-semibold">Lote</th>
                            <th className="p-4 font-semibold">Tipo</th>
                            <th className="p-4 text-right font-semibold">Quantidade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando...</td></tr>
                        ) : movements.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma movimentação encontrada.</td></tr>
                        ) : (
                            movements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">
                                        {new Date(movement.createdAt).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{movement.product.name}</td>
                                    <td className="p-4 font-mono text-sm text-gray-500">
                                        {movement.lot?.code || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${movement.type === 'in' || movement.type === 'production_in'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : movement.type === 'loss'
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {getTypeLabel(movement.type)}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right font-bold ${getTypeColor(movement.type)}`}>
                                        {movement.type === 'in' || movement.type === 'production_in' ? '+' : '-'}
                                        {movement.quantity} {movement.product.unit}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
