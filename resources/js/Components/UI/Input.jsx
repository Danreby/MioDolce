export default function FormField({
    label,
    error,
    hint,
    required,
    className = '',
    children,
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-brown-600">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-brown-400">{hint}</p>}
        </div>
    );
}

export function inputClass(error) {
    return `
        w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-brown-800
        placeholder-brown-300 outline-none transition-colors
        focus:ring-2 focus:ring-brown-200
        ${error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            : 'border-brown-200 focus:border-brown-400'
        }
    `;
}
