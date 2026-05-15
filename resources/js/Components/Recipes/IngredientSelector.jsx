import { useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { inputClass } from '../UI/Input';
import FormField from '../UI/Input';
import { getUnitLabel, formatCurrency, calcIngredientCost } from '../../utils/formatters';

export default function IngredientSelector({ items, ingredients, onChange, errors }) {
    const ingredientMap = useMemo(
        () => Object.fromEntries(ingredients.map((i) => [i.id, i])),
        [ingredients]
    );

    const add = () => {
        onChange([...items, { ingredient_id: '', quantity_used: '' }]);
    };

    const remove = (index) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const update = (index, field, value) => {
        const next = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        onChange(next);
    };

    const totalPreview = useMemo(() => {
        return items.reduce((sum, item) => {
            const ing = ingredientMap[item.ingredient_id];
            if (!ing || !item.quantity_used) return sum;
            return sum + calcIngredientCost(ing, item.quantity_used);
        }, 0);
    }, [items, ingredientMap]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-brown-600">Ingredientes</span>
                {totalPreview > 0 && (
                    <span className="text-xs text-brown-400">
                        Custo estimado: <strong className="text-brown-700">{formatCurrency(totalPreview)}</strong>
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {items.map((item, index) => {
                    const ing     = ingredientMap[item.ingredient_id];
                    const rowCost = ing && item.quantity_used
                        ? calcIngredientCost(ing, item.quantity_used)
                        : null;

                    const ingError = errors?.[`ingredients.${index}.ingredient_id`];
                    const qtyError = errors?.[`ingredients.${index}.quantity_used`];

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-cream-50 rounded-xl border border-cream-200"
                        >
                            <div className="flex-1 min-w-0">
                                <select
                                    value={item.ingredient_id}
                                    onChange={(e) => update(index, 'ingredient_id', e.target.value)}
                                    className={`${inputClass(ingError)} text-sm`}
                                >
                                    <option value="">— Selecionar ingrediente —</option>
                                    {ingredients.map((i) => (
                                        <option key={i.id} value={i.id}>
                                            {i.name} ({getUnitLabel(i.unit)})
                                        </option>
                                    ))}
                                </select>
                                {ingError && <p className="text-xs text-red-500 mt-0.5">{ingError}</p>}
                            </div>

                            <div className="w-28 shrink-0">
                                <div className={`flex items-center rounded-xl border bg-white transition-colors ${qtyError ? 'border-red-400' : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'}`}>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={item.quantity_used}
                                        onChange={(e) => update(index, 'quantity_used', e.target.value)}
                                        placeholder="Qtd."
                                        className="w-full px-3 py-2.5 text-sm bg-transparent outline-none border-none focus:ring-0 text-brown-800 placeholder-brown-300"
                                    />
                                    {ing && (
                                        <span className="pr-2 text-xs text-brown-400 shrink-0">{getUnitLabel(ing.unit)}</span>
                                    )}
                                </div>
                                {qtyError && <p className="text-xs text-red-500 mt-0.5">{qtyError}</p>}
                            </div>

                            <div className="w-20 shrink-0 flex items-center pt-2.5 justify-end">
                                {rowCost !== null ? (
                                    <span className="text-xs font-medium text-brown-600 whitespace-nowrap">
                                        {formatCurrency(rowCost)}
                                    </span>
                                ) : (
                                    <span className="text-xs text-brown-300">—</span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-1.5 mt-1.5 rounded-lg text-brown-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                                title="Remover"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={add}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 hover:text-brown-700 border border-dashed border-brown-300 hover:border-brown-400 rounded-xl transition-colors"
            >
                <Plus size={15} />
                Adicionar ingrediente
            </button>
        </div>
    );
}
