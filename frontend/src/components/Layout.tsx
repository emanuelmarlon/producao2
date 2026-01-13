
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FlaskConical, Factory, Warehouse, BarChart3, ChevronDown, Zap, Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { AIChat } from './AIChat';

const SidebarItem = ({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
            )}
        >
            <Icon size={20} className={clsx('transition-transform duration-200', !isActive && 'group-hover:scale-110')} />
            <span className="font-medium flex-1">{label}</span>
            {badge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
};

const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
                {title}
                <ChevronDown size={16} className={clsx('transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
            <div className={clsx('space-y-1 mt-2 transition-all duration-200', isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
                {children}
            </div>
        </div>
    );
};

export const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2 shadow-md z-20">
                <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800">
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold">ByFormulador</h1>
            </header>
            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 flex flex-col shadow-xl transform transition-transform duration-300 z-30",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                "md:relative md:translate-x-0 md:flex"
            )}>
                {/* Close button for mobile */}
                <button onClick={() => setSidebarOpen(false)} className="md:hidden self-end m-4 text-gray-600 hover:text-gray-800">
                    <ChevronDown size={20} className="transform rotate-180" />
                </button>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl">⚗️</span>
                        </div>
                        ByFormulador
                    </h1>
                    <p className="text-sm text-purple-100 mt-2 font-medium">Sistema de Produção Cosmética</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Painel" />

                    <SidebarSection title="Cadastros">
                        <SidebarItem to="/products" icon={Package} label="Produtos" />
                        <SidebarItem to="/formulas" icon={FlaskConical} label="Fórmulas" />
                    </SidebarSection>

                    <SidebarSection title="Operações">
                        <SidebarItem to="/production" icon={Factory} label="Produção" />
                        <SidebarItem to="/inventory" icon={Warehouse} label="Estoque" />
                        <Link
                            to="/inventory/quick-adjustment"
                            className="flex items-center gap-3 px-4 py-3 ml-4 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-l-2 border-purple-300"
                        >
                            <Zap size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">Ajuste Rápido</span>
                            <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">
                                Novo
                            </span>
                        </Link>
                    </SidebarSection>

                    <SidebarSection title="Análises">
                        <SidebarItem to="/reports" icon={BarChart3} label="Relatórios" />
                    </SidebarSection>
                </nav>

                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="text-xs text-gray-600 text-center">
                        <p className="font-semibold">v1.0.0</p>
                        <p className="text-gray-500">© 2025 ByFormulador</p>
                    </div>
                </div>
            </aside>
            {/* Overlay for mobile when sidebar open */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-20" onClick={() => setSidebarOpen(false)}></div>
            )}
            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 animate-fadeIn">
                    <Outlet />
                </div>
            </main>
            <AIChat />
        </div>
    );
};
