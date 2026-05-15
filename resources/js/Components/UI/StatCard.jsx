import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, color = 'brown', trend }) {
    const COLORS = {
        brown:   { bg: 'bg-brown-600',    text: 'text-white',        icon: 'bg-brown-500' },
        cream:   { bg: 'bg-cream',        text: 'text-brown-700',    icon: 'bg-brown-200' },
        success: { bg: 'bg-emerald-600',  text: 'text-white',        icon: 'bg-emerald-500' },
        warning: { bg: 'bg-amber-500',    text: 'text-white',        icon: 'bg-amber-400' },
        info:    { bg: 'bg-blue-600',     text: 'text-white',        icon: 'bg-blue-500' },
    };

    const c = COLORS[color] ?? COLORS.brown;

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3 shadow-sm`}
        >
            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium uppercase tracking-wider ${c.text} opacity-70`}>
                    {label}
                </span>
                {Icon && (
                    <div className={`w-8 h-8 ${c.icon} rounded-xl flex items-center justify-center`}>
                        <Icon size={16} className={c.text} />
                    </div>
                )}
            </div>
            <p className={`text-2xl font-bold ${c.text} leading-none`}>{value}</p>
            {trend && (
                <p className={`text-xs ${c.text} opacity-60`}>{trend}</p>
            )}
        </motion.div>
    );
}
