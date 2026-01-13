import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProductionOrder, Product, Formula } from '../../types';

export const ProductionOrderReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<ProductionOrder | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [formula, setFormula] = useState<Formula | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderData();
    }, [id]);

    const fetchOrderData = async () => {
        try {
            const orderResponse = await api.get(`/production/${id}`);
            const orderData = orderResponse.data;
            setOrder(orderData);

            if (orderData.productId) {
                const productResponse = await api.get(`/products/${orderData.productId}`);
                setProduct(productResponse.data);
            }

            if (orderData.formulaId) {
                const formulaResponse = await api.get(`/formulas/${orderData.formulaId}`);
                setFormula(formulaResponse.data);
            }
        } catch (error) {
            console.error('Error fetching order data:', error);
            alert('Erro ao carregar dados da ordem de produção');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    if (!order || !product || !formula) {
        return <div className="flex items-center justify-center h-screen">Ordem não encontrada</div>;
    }

    const today = new Date().toLocaleDateString('pt-BR');

    return (
        <div className="production-report-container">
            {/* Print Button - Hidden during print */}
            <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
                <button
                    onClick={() => navigate('/production')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                >
                    <Printer size={20} />
                    Imprimir
                </button>
            </div>

            {/* Production Order Report - Landscape */}
            <div className="production-report">
                {/* Header */}
                <div className="report-header grid grid-cols-3 gap-4 mb-4 border-2 border-black">
                    <div className="flex items-center justify-center p-2 border-r-2 border-black">
                        <div className="text-center">
                            <img
                                src="/logomarca.svg"
                                alt="TRIHAIR"
                                className="h-12 w-auto mx-auto"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.innerHTML = '<div class="text-2xl font-bold">TRIHAIR</div>';
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-2 border-r-2 border-black">
                        <h1 className="text-2xl font-bold text-center">ORDEM DE PRODUÇÃO</h1>
                    </div>
                    <div className="grid grid-rows-2 text-xs">
                        <div className="border-b border-black p-1 text-center">
                            <div className="font-bold">{order.code}</div>
                            <div>{today}</div>
                        </div>
                        <div className="p-1 text-center font-bold">
                            MODO DE FABRICAÇÃO
                        </div>
                    </div>
                </div>

                {/* Batch Info */}
                <div className="grid grid-cols-4 border-2 border-black border-t-0 text-sm">
                    <div className="border-r border-black p-2 flex items-center">
                        <span className="font-bold mr-2">BATELADA EM KG:</span>
                        <span>{order.quantityPlanned} {order.unit}</span>
                    </div>
                    <div className="col-span-2 border-r border-black p-2 flex items-center justify-center">
                        <span className="font-bold">{product.name}</span>
                    </div>
                    <div className="p-2 flex items-center">
                        <span className="font-bold mr-2">LOTE:</span>
                        <span>{order.lotNumber || '_____________'}</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-3 gap-0 border-2 border-black border-t-0">
                    {/* Left Column - Manipulation */}
                    <div className="col-span-2 border-r-2 border-black">
                        {/* Manipulation Section */}
                        <div className="border-b-2 border-black">
                            <div className="bg-gray-200 p-1 text-center font-bold text-sm border-b border-black">
                                MANIPULAÇÃO
                            </div>
                            <div className="grid grid-cols-2 border-b border-black">
                                <div className="border-r border-black p-1 text-center">
                                    <div className="font-bold text-xs">MANIPULADOR</div>
                                    <div className="grid grid-cols-2 text-xs">
                                        <div className="border-r border-black p-1">DATA:</div>
                                        <div className="p-1">HORA:</div>
                                    </div>
                                </div>
                                <div className="p-1 text-center">
                                    <div className="font-bold text-xs">INÍCIO</div>
                                    <div className="grid grid-cols-2 text-xs">
                                        <div className="border-r border-black p-1">DATA:</div>
                                        <div className="p-1">HORA:</div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-black p-1 text-center text-xs">
                                <div className="font-bold">FINAL</div>
                                <div className="grid grid-cols-2">
                                    <div className="border-r border-black p-1">DATA:</div>
                                    <div className="p-1">HORA:</div>
                                </div>
                            </div>
                            <div className="p-1 text-center text-xs font-bold">REATOR</div>
                        </div>

                        {/* Ingredients Table */}
                        <div>
                            <div className="grid grid-cols-6 bg-gray-200 border-b border-black text-xs font-bold text-center">
                                <div className="border-r border-black p-1">CÓDIGO</div>
                                <div className="border-r border-black p-1">MATÉRIA PRIMA</div>
                                <div className="border-r border-black p-1">LOTE</div>
                                <div className="border-r border-black p-1">QUANTIDADE(KG)</div>
                                <div className="border-r border-black p-1">PERCENTUAL</div>
                                <div className="p-1">RESPONSÁVEL</div>
                            </div>
                            {formula.items?.map((item, index) => (
                                <div key={index} className="grid grid-cols-6 border-b border-black text-xs">
                                    <div className="border-r border-black p-1">{item.ingredient?.sku || item.ingredient?.barcode || '-'}</div>
                                    <div className="border-r border-black p-1">{item.ingredient?.name || 'N/A'}</div>
                                    <div className="border-r border-black p-1"></div>
                                    <div className="border-r border-black p-1 text-center">{((order.quantityPlanned * item.percentage) / 100).toFixed(3)}</div>
                                    <div className="border-r border-black p-1 text-center">{item.percentage.toFixed(5)}%</div>
                                    <div className="p-1"></div>
                                </div>
                            ))}
                            <div className="grid grid-cols-6 bg-gray-100 font-bold text-xs">
                                <div className="col-span-3 border-r border-black p-1"></div>
                                <div className="border-r border-black p-1 text-center">{order.quantityPlanned}</div>
                                <div className="border-r border-black p-1 text-center">100.00000%</div>
                                <div className="p-1"></div>
                            </div>
                        </div>

                        {/* Quality Control */}
                        <div className="border-t-2 border-black">
                            <div className="bg-gray-200 p-1 text-center font-bold text-xs border-b border-black">
                                CONTROLE DE QUALIDADE
                            </div>
                            <div className="text-xs p-1 border-b border-black">
                                OS RESULTADOS DA MICROBIOLOGIA SERÃO LANÇADOS EM FORMULÁRIO ESPECÍFICO
                            </div>
                            <div className="grid grid-cols-6 text-xs">
                                <div className="border-r border-black p-1 font-bold">VARIÁVEIS</div>
                                <div className="border-r border-black p-1 font-bold text-center">ESPECIFICAÇÃO</div>
                                <div className="border-r border-black p-1 font-bold text-center">RESULTADOS</div>
                                <div className="col-span-2 border-r border-black p-1 font-bold text-center">AJUSTE DE PROCESSO</div>
                                <div className="p-1 font-bold text-center">ANALISADO POR:</div>
                            </div>
                            <div className="grid grid-cols-6 border-t border-black text-xs">
                                <div className="border-r border-black p-1">PH</div>
                                <div className="border-r border-black p-1 text-center">{product.ph || '-'}</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="col-span-2 border-r border-black p-1 flex items-center gap-2">
                                    <span>( ) NÃO</span>
                                    <span>( ) SIM</span>
                                </div>
                                <div className="p-1 row-span-6"></div>
                            </div>
                            <div className="grid grid-cols-6 border-t border-black text-xs">
                                <div className="border-r border-black p-1">VISCOSIDADE CPS</div>
                                <div className="border-r border-black p-1 text-center">{product.viscosity || '-'}</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="col-span-2 border-r border-black p-1 flex items-center gap-2">
                                    <span>( ) NÃO</span>
                                    <span>( ) SIM</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 border-t border-black text-xs">
                                <div className="border-r border-black p-1">ODOR</div>
                                <div className="border-r border-black p-1 text-center">{product.odor || 'CARACTERÍSTICO'}</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="col-span-2 border-r border-black p-1"></div>
                            </div>
                            <div className="grid grid-cols-6 border-t border-black text-xs">
                                <div className="border-r border-black p-1">ASPECTO</div>
                                <div className="border-r border-black p-1 text-center">{product.aspect || 'GEL VISCOSO'}</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="col-span-2 border-r border-black p-1"></div>
                            </div>
                            <div className="grid grid-cols-6 border-t border-black text-xs">
                                <div className="border-r border-black p-1">DENSIDADE</div>
                                <div className="border-r border-black p-1 text-center">{product.density || 'X'}</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="col-span-2 border-r border-black p-1"></div>
                            </div>
                            <div className="grid grid-cols-6 border-t border-black text-xs">
                                <div className="border-r border-black p-1">COR</div>
                                <div className="border-r border-black p-1 text-center">{product.color || 'ROXO'}</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="col-span-2 border-r border-black p-1"></div>
                            </div>
                        </div>

                        {/* Technical Responsible */}
                        <div className="border-t-2 border-black p-2 text-xs">
                            <div className="grid grid-cols-2">
                                <div>RESPONSÁVEL TÉCNICO: ________________________</div>
                                <div className="text-right">DATA: ______________</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Manufacturing Mode and Conferente */}
                    <div>
                        <div className="border-b border-black p-2 text-xs" style={{ minHeight: '400px' }}>
                            <div className="whitespace-pre-wrap text-justify" style={{ fontSize: '10px', lineHeight: '1.4' }}>
                                {product.manufacturingMode || 'Instruções de fabricação não disponíveis'}
                            </div>
                        </div>
                        <div className="p-2">
                            <div className="font-bold mb-2 text-center text-xs border-b border-black pb-1">VISTO ALMOXARIFADO</div>
                            <div className="text-xs mb-1">DATA:</div>
                            <div className="border-t-2 border-black mt-16"></div>
                            <div className="text-xs text-center mt-1">CONFERIDO POR GARANTIA DE QUALIDADE</div>
                            <div className="text-xs mt-1">RESPONSÁVEL:</div>
                            <div className="border-b border-black mt-12"></div>
                            <div className="text-xs mt-1">DATA:</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    /* Remove all margins and paddings from html and body */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    
                    /* Page setup */
                    @page {
                        size: A4 landscape;
                        margin: 8mm;
                    }
                    
                    /* Hide everything that's not the report */
                    body * {
                        visibility: hidden;
                    }
                    
                    /* Show only the production report container and its children */
                    .production-report-container,
                    .production-report-container * {
                        visibility: visible;
                    }
                    
                    /* Hide buttons within the report */
                    .no-print,
                    .no-print * {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    
                    /* Position the report container */
                    .production-report-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                    }
                    
                    /* Style the report for print */
                    .production-report {
                        padding: 0.5cm;
                        font-size: 9px;
                        width: 100%;
                        max-width: 100%;
                        margin: 0;
                        box-shadow: none;
                    }
                    
                    /* Preserve colors */
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    /* Prevent page breaks */
                    .production-report {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
                
                /* Screen styles */
                @media screen {
                    .production-report-container {
                        min-height: 100vh;
                        background: #f5f5f5;
                        padding: 2rem 0;
                    }
                    
                    .production-report {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: white;
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        padding: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};
