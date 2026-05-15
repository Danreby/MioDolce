import { Candy } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFlash } from '../hooks/useFlash';

export default function GuestLayout({ children }) {
    useFlash();

    return (
        <div className="min-h-screen bg-cream-50 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

                <Link href="/login" className="flex flex-col items-center gap-3 mb-8 group select-none">
                    <div className="w-16 h-16 bg-brown-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-brown-700 transition-colors">
                        <Candy size={28} className="text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-brown-700 leading-none">MioDolce</h1>
                        <p className="text-xs text-brown-400 mt-1">Gestão de Receitas e Custos</p>
                    </div>
                </Link>

                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
                    {children}
                </div>
            </div>

            <footer className="py-4 text-center">
                <p className="text-xs text-brown-300">MioDolce © {new Date().getFullYear()}</p>
            </footer>

            <ToastContainer
                position="top-right"
                autoClose={3500}
                toastStyle={{ background: '#583c29', color: '#f5f0eb', fontSize: '14px' }}
                progressStyle={{ background: '#af987e' }}
            />
        </div>
    );
}
