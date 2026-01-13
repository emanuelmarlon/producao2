import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { api } from '../lib/api';

const COLORS = ['#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

interface KPIData {
    activeOrders: number;
    productsInStock: number;
    lowStockItems: number;
    pendingFormulas: number;
}

interface ChartDataPoint {
    name: string;
    value: number;
    [key: string]: any;
}

export const Dashboard = () => {
    const [kpis, setKpis] = useState<KPIData>({
        activeOrders: 0,
        productsInStock: 0,
        lowStockItems: 0,
        pendingFormulas: 0
    });
    const [productionData, setProductionData] = useState<ChartDataPoint[]>([]);
    const [stockData, setStockData] = useState<ChartDataPoint[]>([]);
    const [costData, setCostData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const kpisResponse = await api.get('/statistics/kpis');
            setKpis(kpisResponse.data);

            const productionResponse = await api.get('/statistics/production-by-month');
            setProductionData(productionResponse.data);

            const stockResponse = await api.get('/statistics/stock-trend');
            setStockData(stockResponse.data);

            const costResponse = await api.get('/statistics/cost-distribution');
            setCostData(costResponse.data);
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Painel de Controle</h2>
                <p className="text-gray-600">Visão geral do seu sistema de produção</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Carregando dados...</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all">
                            <h3 className="text-white text-sm font-semibold mb-2 opacity-90">Ordens Ativas</h3>
                            <p className="text-white text-4xl font-bold">{kpis.activeOrders}</p>
                            <p className="text-purple-100 text-xs mt-2">Planejadas ou em andamento</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all">
                            <h3 className="text-white text-sm font-semibold mb-2 opacity-90">Produtos Cadastrados</h3>
                            <p className="text-white text-4xl font-bold">{kpis.productsInStock}</p>
                            <p className="text-green-100 text-xs mt-2">Total no sistema</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all">
                            <h3 className="text-white text-sm font-semibold mb-2 opacity-90">Itens Monitorados</h3>
                            <p className="text-white text-4xl font-bold">{kpis.lowStockItems}</p>
                            <p className="text-yellow-100 text-xs mt-2">Com estoque mínimo definido</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all">
                            <h3 className="text-white text-sm font-semibold mb-2 opacity-90">Fórmulas Pendentes</h3>
                            <p className="text-white text-4xl font-bold">{kpis.pendingFormulas}</p>
                            <p className="text-pink-100 text-xs mt-2">Aguardando aprovação</p>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Production Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Produção Mensal (kg)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={productionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" fill="url(#purpleGradient)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#A855F7" />
                                            <stop offset="100%" stopColor="#EC4899" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Cost Distribution */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Distribuição de Custos</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={costData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {costData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stock Evolution */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Evolução do Estoque (Última Semana)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stockData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-8 rounded-2xl shadow-2xl">
                        <h3 className="text-3xl font-bold mb-4 text-white">
                            Bem-vindo ao ByFormulador
                        </h3>
                        <p className="text-white text-lg opacity-90 mb-6">
                            Gerencie produtos, fórmulas, ordens de produção e estoque de forma integrada e profissional.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-3xl font-bold text-white">100%</div>
                                <div className="text-sm text-white opacity-80">Rastreável</div>
                            </div>
                            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-3xl font-bold text-white">Real-time</div>
                                <div className="text-sm text-white opacity-80">Atualização</div>
                            </div>
                            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-3xl font-bold text-white">5 Casas</div>
                                <div className="text-sm text-white opacity-80">Precisão</div>
                            </div>
                            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-3xl font-bold text-white">Completo</div>
                                <div className="text-sm text-white opacity-80">ERP</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
