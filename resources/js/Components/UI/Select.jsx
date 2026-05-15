export default function Input({
    label,
    error,
    hint,
    prefix,
    suffix,
    className = '',
    inputClassName = '',
    required,
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-brown-600">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}

            <div className={`
                flex items-center gap-2 rounded-xl border bg-white transition-colors
                ${error
                    ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-300'
                    : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'
                }
            `}>
                {prefix && (
                    <span className="pl-3 text-sm text-brown-400 shrink-0 select-none">{prefix}</span>
                )}
                <input
                    className={`
                        flex-1 bg-transparent px-3 py-2.5 text-sm text-brown-800 placeholder-brown-300
                        outline-none border-none focus:ring-0 min-w-0
                        ${prefix ? 'pl-0' : ''}
                        ${suffix ? 'pr-0' : ''}
                        ${inputClassName}
                    `}
                    {...props}
                />
                {suffix && (
                    <span className="pr-3 text-sm text-brown-400 shrink-0 select-none">{suffix}</span>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
            {hint && !error && (
                <p className="text-xs text-brown-400">{hint}</p>
            )}
        </div>
    );
}
