import { Link } from 'react-router-dom';
import { BarChart3, History, AlertTriangle, Calendar } from 'lucide-react';

export const Reports = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Relatórios</h2>
                <p className="text-gray-600">Análises e relatórios do sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/reports/stock" className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all">
                            <BarChart3 size={28} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Posição de Estoque</h3>
                    <p className="text-gray-600">
                        Relatório detalhado com quantidade atual, custo e valor total em estoque por produto.
                    </p>
                </Link>

                <Link to="/reports/movements" className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 transition-all shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white transition-all">
                            <History size={28} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Histórico de Movimentações</h3>
                    <p className="text-gray-600">
                        Extrato completo de entradas e saídas, filtrado por período, tipo e produto.
                    </p>
                </Link>

                <Link to="/reports/low-stock" className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-yellow-400 transition-all shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600 group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-orange-500 group-hover:text-white transition-all">
                            <AlertTriangle size={28} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Estoque Baixo</h3>
                    <p className="text-gray-600">
                        Produtos que estão abaixo do estoque mínimo definido e precisam de reposição.
                    </p>
                </Link>

                <Link to="/reports/expiration" className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-red-400 transition-all shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-100 rounded-xl text-red-600 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-red-600 group-hover:text-white transition-all">
                            <Calendar size={28} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Validade de Lotes</h3>
                    <p className="text-gray-600">
                        Monitoramento de lotes próximos do vencimento ou já vencidos.
                    </p>
                </Link>

                <Link to="/reports/stock-count" className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                            <BarChart3 size={28} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Contagem de Estoque</h3>
                    <p className="text-gray-600">
                        Relatório completo de contagem de estoque com detalhes de lotes.
                    </p>
                </Link>

                <Link to="/reports/adjustments" className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-pink-400 transition-all shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-pink-100 rounded-xl text-pink-600 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-pink-600 group-hover:text-white transition-all">
                            <History size={28} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Histórico de Ajustes</h3>
                    <p className="text-gray-600">
                        Registro completo de todos os ajustes de estoque realizados.
                    </p>
                </Link>
            </div>
        </div>
    );
};
