import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumbs, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1 text-xs text-brown-400 mb-1" aria-label="Breadcrumb">
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <ChevronRight size={12} />}
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-brown-600 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-brown-600 font-medium">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                <h1 className="text-2xl font-bold text-brown-700">{title}</h1>
                {subtitle && <p className="text-sm text-brown-400 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
