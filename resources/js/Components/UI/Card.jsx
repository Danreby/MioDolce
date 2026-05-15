export default function Card({ children, className = '', padding = true }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-cream-200 ${padding ? 'p-6' : ''} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
    return (
        <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
            <div>
                <h2 className="text-base font-semibold text-brown-700">{title}</h2>
                {subtitle && <p className="text-sm text-brown-400 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
