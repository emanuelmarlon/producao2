import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../types';



export const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
            // alert('Erro ao carregar produtos. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Erro ao excluir produto', error);
                alert('Erro ao excluir produto. Tente novamente.');
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || product.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter]);

    if (loading) return <div className="text-center p-10 text-gray-600">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Produtos</h2>
                    <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
                </div>
                <Link
                    to="/products/new"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
                >
                    <Plus size={20} />
                    Novo Produto
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nome, SKU ou código de barras..."
                                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                        >
                            <option value="all">Todos os Tipos</option>
                            <option value="raw_material">Matéria-Prima</option>
                            <option value="finished">Produto Acabado</option>
                            <option value="packaging">Embalagem</option>
                            <option value="intermediate">Intermediário</option>
                        </select>
                    </div>
                    {filteredProducts.length > 0 && (
                        <div className="text-sm text-gray-600">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} produtos
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-semibold">Nome</th>
                                <th className="p-5 font-semibold">SKU</th>
                                <th className="p-5 font-semibold">Tipo</th>
                                <th className="p-5 font-semibold">Unidade</th>
                                <th className="p-5 font-semibold">Custo</th>
                                <th className="p-5 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-5">
                                        <div className="font-semibold text-gray-800">{product.name}</div>
                                        {product.barcode && (
                                            <div className="text-xs text-gray-500 mt-1">Barcode: {product.barcode}</div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm text-gray-700 font-mono">{product.sku || '-'}</div>
                                        {product.supplierCode && (
                                            <div className="text-xs text-gray-500 mt-1">Forn: {product.supplierCode}</div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.type === 'finished' ? 'bg-green-100 text-green-700' :
                                            product.type === 'raw_material' ? 'bg-yellow-100 text-yellow-700' :
                                                product.type === 'packaging' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {product.type === 'finished' ? 'Acabado' :
                                                product.type === 'raw_material' ? 'Matéria-Prima' :
                                                    product.type === 'packaging' ? 'Embalagem' : 'Intermediário'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-gray-700">{product.unit}</td>
                                    <td className="p-5 font-mono text-gray-800 font-semibold">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 5
                                        }).format(product.currentCost)}
                                    </td>
                                    <td className="p-5 flex gap-2">
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <div className="text-6xl mb-4">📦</div>
                                        <div className="text-lg font-medium">Nenhum produto encontrado</div>
                                        <div className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2.5 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl text-gray-700 border border-gray-300 transition-colors font-medium shadow-sm"
                        >
                            Anterior
                        </button>
                        <span className="text-gray-600 font-medium">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2.5 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl text-gray-700 border border-gray-300 transition-colors font-medium shadow-sm"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
