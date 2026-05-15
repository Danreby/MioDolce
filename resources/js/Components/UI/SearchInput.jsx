import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Pesquisar...', className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-300 pointer-events-none"
            />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="
                    w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-brown-200
                    bg-white text-brown-800 placeholder-brown-300
                    focus:outline-none focus:border-brown-400 focus:ring-2 focus:ring-brown-200
                    transition-colors
                "
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-300 hover:text-brown-500 transition-colors"
                    aria-label="Limpar pesquisa"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
