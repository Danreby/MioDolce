import { motion } from 'framer-motion';
import { ChefHat, Package, Star, Trophy } from 'lucide-react';

const CARDS = (stats) => [
    {
        icon:  ChefHat,
        label: 'Receitas criadas',
        value: stats.total_recipes,
        color: 'bg-amber-50 text-amber-600',
    },
    {
        icon:  Package,
        label: 'Ingredientes cadastrados',
        value: stats.total_ingredients,
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        icon:  Star,
        label: 'Dias na plataforma',
        value: stats.member_days,
        color: 'bg-purple-50 text-purple-600',
    },
    {
        icon:  Trophy,
        label: 'Receitas por ingrediente',
        value: stats.total_ingredients > 0
            ? (stats.total_recipes / stats.total_ingredients).toFixed(1)
            : '—',
        color: 'bg-rose-50 text-rose-600',
    },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const item = {
    hidden: { opacity: 0, y: 14 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function ProfileStats({ stats }) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
            {CARDS(stats).map((card) => (
                <motion.div
                    key={card.label}
                    variants={item}
                    whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400 } }}
                    className="bg-white rounded-2xl p-5 border border-brown-200/30 shadow-sm flex flex-col gap-3"
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                        <card.icon size={18} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brown-700">{card.value}</p>
                        <p className="text-xs text-brown-400 mt-0.5">{card.label}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
