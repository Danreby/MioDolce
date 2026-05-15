const VARIANTS = {
    default:  'bg-cream text-brown-600',
    primary:  'bg-brown-100 text-brown-700',
    success:  'bg-emerald-100 text-emerald-700',
    warning:  'bg-amber-100 text-amber-700',
    danger:   'bg-red-100 text-red-700',
    info:     'bg-blue-100 text-blue-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
    return (
        <span className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            ${VARIANTS[variant] ?? VARIANTS.default}
            ${className}
        `}>
            {children}
        </span>
    );
}
