import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Candy } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import UserAvatar from '../Components/UI/UserAvatar';
import { useFlash } from '../hooks/useFlash';

export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props: { auth } } = usePage();
    const user = auth?.user;

    useFlash();

    return (
        <div className="min-h-screen bg-cream-50">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* ── Sticky header ── */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-brown-200/40 px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3 shadow-sm">

                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-brown-600 hover:bg-cream rounded-xl transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu size={20} />
                </button>

                <Link href="/" className="flex items-center gap-2 select-none">
                    <div className="w-7 h-7 bg-brown-600 rounded-lg flex items-center justify-center shrink-0">
                        <Candy size={13} className="text-white" />
                    </div>
                    <span className="font-bold text-brown-700 text-sm hidden sm:block">MioDolce</span>
                </Link>

                <div className="flex-1" />

                {user && (
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-cream transition-colors group"
                    >
                        <span className="hidden sm:block text-sm font-medium text-brown-500 group-hover:text-brown-700 max-w-[140px] truncate">
                            {user.name}
                        </span>
                        <UserAvatar user={user} size="sm" />
                    </Link>
                )}
            </header>

            {/* ── Main content ── */}
            <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
                {children}
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                toastStyle={{ background: '#583c29', color: '#f5f0eb', fontSize: '14px' }}
                progressStyle={{ background: '#af987e' }}
            />
        </div>
    );
}
