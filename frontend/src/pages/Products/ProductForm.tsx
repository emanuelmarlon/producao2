import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Product } from '../../types';

// Local storage helper functions


export const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        supplierCode: '',
        dumCode: '',
        type: 'raw_material',
        density: 1.0,
        unit: 'kg',
        minStock: 0,
        currentCost: 0,
    });

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setFormData(response.data);
        } catch (error) {
            console.error('Product not found', error);
            alert('Erro ao carregar produto. Tente novamente.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Salvando produto:', formData);
            if (isEdit) {
                await api.put(`/products/${id}`, formData);
                console.log('✅ Produto atualizado no Supabase');
            } else {
                await api.post('/products', formData);
                console.log('✅ Produto criado no Supabase');
            }
            navigate('/products');
        } catch (error: any) {
            console.error('Failed to save product', error);
            alert(`Erro ao salvar produto: ${error.response?.data?.error || error.message || 'Verifique os dados e tente novamente.'}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
                    <textarea
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">SKU</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.sku || ''}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="SKU-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Código de Barras</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.barcode || ''}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="7891234567890"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Código Fornecedor</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.supplierCode || ''}
                            onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                            placeholder="FORN-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Código DUM</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.dumCode || ''}
                            onChange={(e) => setFormData({ ...formData, dumCode: e.target.value })}
                            placeholder="1789..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
                        <select
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        >
                            <option value="raw_material">Matéria-Prima</option>
                            <option value="finished">Produto Acabado</option>
                            <option value="packaging">Embalagem</option>
                            <option value="intermediate">Intermediário</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Unidade *</label>
                        <select
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="L">L</option>
                            <option value="ml">ml</option>
                            <option value="un">un</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Densidade (g/cm³) *</label>
                        <input
                            type="number"
                            step="0.001"
                            required
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.density}
                            onChange={(e) => setFormData({ ...formData, density: parseFloat(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Usado para cálculo de quantidades</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Peso/Vol. Líquido</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.netWeight || 0}
                            onChange={(e) => setFormData({ ...formData, netWeight: parseFloat(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Conteúdo padrão (ex: 500g, 200ml)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Estoque Mínimo</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.minStock}
                            onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Custo Atual (R$)</label>
                        <input
                            type="number"
                            step="0.00001"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.currentCost || 0}
                            onChange={(e) => setFormData({ ...formData, currentCost: parseFloat(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Custo médio por {formData.unit}</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Especificações Técnicas</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">pH</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.ph || ''}
                                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                                placeholder="Ex: 5.5 - 6.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Viscosidade (cps)</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.viscosity || ''}
                                onChange={(e) => setFormData({ ...formData, viscosity: e.target.value })}
                                placeholder="Ex: 2000 - 3000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Cor</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.color || ''}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="Ex: Branco Perolado"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Odor</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.odor || ''}
                                onChange={(e) => setFormData({ ...formData, odor: e.target.value })}
                                placeholder="Ex: Característico"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Aspecto</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.aspect || ''}
                                onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                                placeholder="Ex: Líquido Viscoso"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Modo de Fabricação</label>
                    <textarea
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-48"
                        value={formData.manufacturingMode || ''}
                        onChange={(e) => setFormData({ ...formData, manufacturingMode: e.target.value })}
                        placeholder="Descreva o processo de fabricação detalhadamente..."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Salvar Produto
                    </button>
                </div>
            </form>
        </div>
    );
};
