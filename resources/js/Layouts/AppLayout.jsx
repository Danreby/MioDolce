import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ChefHat,
    Menu,
    X,
    Candy,
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFlash } from '../hooks/useFlash';

const NAV_ITEMS = [
    { href: '/',            label: 'Dashboard',    icon: LayoutDashboard },
    { href: '/ingredients', label: 'Ingredientes', icon: Package },
    { href: '/recipes',     label: 'Receitas',     icon: ChefHat },
];

function NavItem({ href, label, icon: Icon, currentUrl, onClick }) {
    const isActive = currentUrl === href || currentUrl.startsWith(href + '/');

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                    ? 'bg-brown-700 text-white shadow-sm'
                    : 'text-white/65 hover:bg-brown-700/60 hover:text-white'
                }
            `}
        >
            <Icon
                size={18}
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-brown-200' : ''}`}
            />
            <span>{label}</span>
        </Link>
    );
}

export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    useFlash();

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="min-h-screen bg-cream-50 flex">

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-fade-in"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 bg-brown-600 z-30 flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto
                `}
                aria-label="Menu de navegação"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-brown-200 rounded-lg flex items-center justify-center">
                            <Candy size={16} className="text-brown-600" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none">MioDolce</p>
                            <p className="text-brown-200 text-[10px] mt-0.5">Gestão de Receitas</p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        onClick={closeSidebar}
                        aria-label="Fechar menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.href}
                            {...item}
                            currentUrl={url}
                            onClick={closeSidebar}
                        />
                    ))}
                </nav>

                <div className="px-6 py-4 border-t border-white/10">
                    <p className="text-[11px] text-white/30 text-center">
                        MioDolce © {new Date().getFullYear()}
                    </p>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">

                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-brown-200/40 px-4 lg:px-8 h-16 flex items-center gap-4 shadow-sm">
                    <button
                        className="lg:hidden p-2 text-brown-600 hover:bg-cream rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menu"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1" />
                    <div className="hidden sm:flex items-center gap-2 text-sm text-brown-400">
                        <Candy size={15} />
                        <span>Calculadora de Custos</span>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-screen-2xl w-full mx-auto">
                    {children}
                </main>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                toastStyle={{
                    background: '#583c29',
                    color:      '#f5f0eb',
                    fontSize:   '14px',
                }}
                progressStyle={{ background: '#af987e' }}
            />
        </div>
    );
}
