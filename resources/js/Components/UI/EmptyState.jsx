export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {Icon && (
                <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mb-4">
                    <Icon size={28} className="text-brown-300" />
                </div>
            )}
            <h3 className="text-base font-semibold text-brown-600 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-brown-400 max-w-xs mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}
