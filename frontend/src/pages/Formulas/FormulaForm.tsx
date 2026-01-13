import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '../../lib/api';
import type { Formula, Product } from '../../types';

export const FormulaForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState<Partial<Formula>>({
        productId: '',
        version: '1.0',
        description: '',
        status: 'draft',
        batchSize: 500,
        items: [],
    });

    useEffect(() => {
        fetchProducts();
        if (isEdit) fetchFormula();
    }, [id]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos', error);
            alert('Erro ao carregar lista de produtos.');
        }
    };

    const fetchFormula = async () => {
        try {
            const response = await api.get(`/formulas/${id}`);
            setFormData(response.data);
        } catch (error) {
            console.error('Erro ao buscar fórmula', error);
            alert('Erro ao carregar fórmula.');
        }
    };

    const handleAddItem = () => {
        const total = (formData.items || []).reduce((s, i) => s + (i.percentage || 0), 0);
        if (total >= 100) {
            alert('A soma das porcentagens já está em 100%. Não é possível adicionar mais ingredientes.');
            return;
        }
        setFormData({
            ...formData,
            items: [
                ...(formData.items || []),
                {
                    id: `temp-${Date.now()}`,
                    formulaId: id || '',
                    ingredientId: '',
                    percentage: 0,
                    unit: 'kg',
                    phase: 1,
                },
            ],
        });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const total = (formData.items || []).reduce((s, i) => s + (i.percentage || 0), 0);
        if (formData.status !== 'draft' && Math.abs(total - 100) > 0.0001) {
            alert(`Para aprovar a fórmula, a soma das porcentagens deve ser 100%. Atual: ${total.toFixed(5)}%`);
            return;
        }
        try {
            const cleanItems = formData.items
                ?.filter((i) => i.ingredientId && i.percentage > 0)
                .map(({ id, formulaId, ingredient, ...rest }) => ({
                    ingredientId: rest.ingredientId,
                    percentage: Number(rest.percentage),
                    unit: rest.unit,
                    phase: Number(rest.phase),
                    notes: rest.notes,
                }));
            const { product, items, ...rest } = formData;
            const cleanData = { ...rest, batchSize: Number(formData.batchSize), items: cleanItems };
            if (isEdit) {
                await api.put(`/formulas/${id}`, cleanData);
            } else {
                await api.post('/formulas', cleanData);
            }
            navigate('/formulas');
        } catch (error: any) {
            console.error('Erro ao salvar fórmula', error);
            alert(`Erro ao salvar fórmula: ${error.response?.data?.error || error.message}`);
        }
    };

    const calculateQuantity = (percentage: number, ingredientId: string): number => {
        if (!percentage || !formData.batchSize) return 0;
        const ingredient = products.find((p) => p.id === ingredientId);
        if (!ingredient) return 0;
        return (formData.batchSize * percentage) / 100;
    };

    const totalPercentage = (formData.items || []).reduce((s, i) => s + (i.percentage || 0), 0);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{isEdit ? 'Editar Fórmula' : 'Nova Fórmula'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Produto (Saída) *</label>
                            <select
                                required
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            >
                                <option value="">Selecione o Produto</option>
                                {products
                                    .filter((p) => p.type === 'finished' || p.type === 'intermediate')
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Versão *</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tamanho do Lote (gramas) *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.batchSize}
                                onChange={(e) => setFormData({ ...formData, batchSize: parseFloat(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Base para cálculo das quantidades</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Status *</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="draft">Rascunho</option>
                                <option value="approved">Aprovada</option>
                                <option value="archived">Arquivada</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
                        <textarea
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <span className={`text-lg font-bold ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {totalPercentage.toFixed(2)}%
                    </span>
                    {Math.abs(totalPercentage - 100) > 0.1 && (
                        <p className="text-xs text-yellow-400 mt-1">⚠️ A soma deve ser 100%</p>
                    )}
                </div>
                <div className="space-y-4">
                    {formData.items?.map((item, index) => {
                        const quantity = calculateQuantity(item.percentage, item.ingredientId);
                        return (
                            <div key={index} className="flex gap-4 items-start bg-white p-4 rounded-lg border border-gray-100">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Ingrediente *</label>
                                    <select
                                        required
                                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800"
                                        value={item.ingredientId}
                                        onChange={(e) => handleItemChange(index, 'ingredientId', e.target.value)}
                                    >
                                        <option value="">Selecione o Ingrediente</option>
                                        {products
                                            .filter((p) => p.type === 'raw_material' || p.type === 'intermediate')
                                            .map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="w-28">
                                    <label className="block text-xs text-gray-500 mb-1">Porcentagem (%) *</label>
                                    <input
                                        type="number"
                                        step="0.00001"
                                        required
                                        min="0"
                                        max="100"
                                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800"
                                        value={item.percentage}
                                        onChange={(e) => handleItemChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="w-28">
                                    <label className="block text-xs text-gray-500 mb-1">Quantidade (g)</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm text-gray-600"
                                        value={quantity.toFixed(2)}
                                    />
                                </div>
                                <div className="w-20">
                                    <label className="block text-xs text-gray-500 mb-1">Fase</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800"
                                        value={item.phase}
                                        onChange={(e) => handleItemChange(index, 'phase', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="mt-6 text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                    {(!formData.items || formData.items.length === 0) && (
                        <p className="text-gray-500 text-center py-4">Nenhum ingrediente adicionado ainda.</p>
                    )}
                    <button
                        type="button"
                        onClick={handleAddItem}
                        disabled={totalPercentage >= 100}
                        className={clsx(
                            'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors',
                            totalPercentage >= 100 && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        Adicionar Ingrediente
                    </button>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/formulas')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Salvar Fórmula
                    </button>
                </div>
            </form>
        </div>
    );
};
