import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../UI/Badge';
import { formatCurrency } from '../../utils/formatters';

export default function RecipeCard({ recipe, onDelete }) {
    const margin = recipe.profit_margin_percent;
    const marginVariant =
        margin === null  ? 'default' :
        margin >= 50     ? 'success' :
        margin >= 20     ? 'warning' :
                           'danger';

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="bg-white rounded-2xl border border-cream-200 shadow-sm p-5 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-brown-700 truncate text-base">{recipe.name}</h3>
                    {recipe.description && (
                        <p className="text-xs text-brown-400 mt-0.5 line-clamp-2">{recipe.description}</p>
                    )}
                </div>
                <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center shrink-0">
                    <ChefHat size={16} className="text-brown-400" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <p className="text-xs text-brown-400">Custo total</p>
                    <p className="font-semibold text-brown-700">{formatCurrency(recipe.total_cost)}</p>
                </div>
                <div>
                    <p className="text-xs text-brown-400">Preço venda</p>
                    <p className="font-semibold text-brown-700">
                        {recipe.selling_price_per_unit
                            ? formatCurrency(recipe.selling_price_per_unit)
                            : <span className="text-brown-300">—</span>
                        }
                    </p>
                </div>
                <div>
                    <p className="text-xs text-brown-400">Rendimento</p>
                    <p className="text-brown-600">{recipe.yield_quantity} {recipe.yield_unit}</p>
                </div>
                <div>
                    <p className="text-xs text-brown-400">Margem</p>
                    {margin !== null ? (
                        <Badge variant={marginVariant}>{margin.toFixed(1)}%</Badge>
                    ) : (
                        <span className="text-brown-300 text-xs">—</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-cream/60">
                <Link
                    href={route('recipes.show', recipe.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-brown-600 hover:bg-cream rounded-lg transition-colors"
                >
                    <Eye size={13} /> Ver detalhes
                </Link>
                <Link
                    href={route('recipes.edit', recipe.id)}
                    className="p-1.5 rounded-lg text-brown-400 hover:bg-cream hover:text-brown-600 transition-colors"
                    title="Editar"
                >
                    <Pencil size={14} />
                </Link>
                <button
                    onClick={() => onDelete(recipe)}
                    className="p-1.5 rounded-lg text-brown-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
}
