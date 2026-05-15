const VARIANTS = {
    primary:   'bg-brown-600 hover:bg-brown-700 text-white shadow-sm',
    secondary: 'bg-brown-200 hover:bg-brown-300 text-brown-700',
    ghost:     'bg-transparent hover:bg-cream text-brown-600 border border-brown-200 hover:border-brown-300',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
};

const SIZES = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
};

export default function Button({
    children,
    variant = 'primary',
    size    = 'md',
    icon: Icon,
    loading = false,
    disabled = false,
    className = '',
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <button
            disabled={isDisabled}
            className={`
                inline-flex items-center justify-center font-medium rounded-xl
                transition-all duration-200 select-none
                focus:outline-none focus:ring-2 focus:ring-brown-400 focus:ring-offset-1
                disabled:opacity-50 disabled:cursor-not-allowed
                ${VARIANTS[variant] ?? VARIANTS.primary}
                ${SIZES[size]      ?? SIZES.md}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
            ) : (
                Icon && <Icon size={size === 'sm' ? 14 : 16} className="shrink-0" />
            )}
            {children}
        </button>
    );
}
