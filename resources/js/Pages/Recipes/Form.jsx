import { useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../Components/UI/PageHeader';
import Button from '../../Components/UI/Button';
import Card from '../../Components/UI/Card';
import FormField, { inputClass } from '../../Components/UI/Input';
import IngredientSelector from '../../Components/Recipes/IngredientSelector';
import CostSummary from '../../Components/Recipes/CostSummary';
import { UNIT_OPTIONS, calcTotalCost } from '../../utils/formatters';

export default function RecipeForm({ recipe, ingredients }) {
    const isEditing = Boolean(recipe?.id);

    const ingredientMap = useMemo(
        () => Object.fromEntries(ingredients.map((i) => [String(i.id), i])),
        [ingredients]
    );

    const { data, setData, post, put, processing, errors } = useForm({
        name:                   recipe?.name                    ?? '',
        description:            recipe?.description             ?? '',
        yield_quantity:         recipe?.yield_quantity          ?? '',
        yield_unit:             recipe?.yield_unit              ?? 'un.',
        selling_price_per_unit: recipe?.selling_price_per_unit  ?? '',
        notes:                  recipe?.notes                   ?? '',
        ingredients: recipe?.recipe_ingredients?.map((ri) => ({
            ingredient_id: String(ri.ingredient_id),
            quantity_used: ri.quantity_used,
        })) ?? [],
    });

    const totalCostPreview = useMemo(
        () => calcTotalCost(data.ingredients, ingredientMap),
        [data.ingredients, ingredientMap]
    );

    const costPreviewData = useMemo(() => {
        const yieldQty  = parseFloat(data.yield_quantity)         || 1;
        const sellPrice = parseFloat(data.selling_price_per_unit) || null;
        const perUnit   = totalCostPreview / yieldQty;
        const profitPU  = sellPrice !== null ? sellPrice - perUnit : null;
        const profitTotal = sellPrice !== null ? (sellPrice - perUnit) * yieldQty : null;
        const margin = sellPrice ? ((sellPrice - perUnit) / sellPrice) * 100 : null;
        return {
            total_cost:              totalCostPreview,
            cost_per_unit:           perUnit,
            yield_quantity:          yieldQty,
            selling_price_per_unit:  sellPrice,
            profit_per_unit:         profitPU,
            profit_total:            profitTotal,
            profit_margin_percent:   margin,
        };
    }, [totalCostPreview, data.yield_quantity, data.selling_price_per_unit]);

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('recipes.update', recipe.id));
        } else {
            post(route('recipes.store'));
        }
    };

    return (
        <>
            <PageHeader
                title={isEditing ? 'Editar Receita' : 'Nova Receita'}
                breadcrumbs={[
                    { href: route('recipes.index'), label: 'Receitas' },
                    { label: isEditing ? recipe.name : 'Nova' },
                ]}
                action={
                    <Button
                        variant="ghost"
                        icon={ArrowLeft}
                        onClick={() => router.visit(route('recipes.index'))}
                    >
                        Voltar
                    </Button>
                }
            />

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left column — main fields */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <Card>
                            <h2 className="text-sm font-semibold text-brown-600 mb-4">Informações da Receita</h2>
                            <div className="flex flex-col gap-4">

                                <FormField label="Nome" error={errors.name} required>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ex: Brigadeiro gourmet"
                                        autoFocus
                                        className={inputClass(errors.name)}
                                    />
                                </FormField>

                                <FormField label="Descrição" error={errors.description}>
                                    <textarea
                                        rows={2}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Descrição opcional..."
                                        className={inputClass(errors.description)}
                                    />
                                </FormField>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Rendimento" error={errors.yield_quantity} required>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.yield_quantity}
                                            onChange={(e) => setData('yield_quantity', e.target.value)}
                                            placeholder="30"
                                            className={inputClass(errors.yield_quantity)}
                                        />
                                    </FormField>
                                    <FormField label="Unidade rendimento" error={errors.yield_unit} required>
                                        <input
                                            type="text"
                                            value={data.yield_unit}
                                            onChange={(e) => setData('yield_unit', e.target.value)}
                                            placeholder="un., fatias, g..."
                                            className={inputClass(errors.yield_unit)}
                                        />
                                    </FormField>
                                </div>

                                <FormField
                                    label="Preço de venda por unidade (R$)"
                                    error={errors.selling_price_per_unit}
                                    hint="Deixe em branco para calcular somente o custo"
                                >
                                    <div className={`flex items-center rounded-xl border bg-white transition-colors ${errors.selling_price_per_unit ? 'border-red-400' : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'}`}>
                                        <span className="pl-3 text-sm text-brown-400 shrink-0">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.selling_price_per_unit}
                                            onChange={(e) => setData('selling_price_per_unit', e.target.value)}
                                            placeholder="0,00"
                                            className="flex-1 pl-2 pr-3 py-2.5 text-sm text-brown-800 placeholder-brown-300 bg-transparent outline-none border-none focus:ring-0 min-w-0"
                                        />
                                    </div>
                                    {errors.selling_price_per_unit && <p className="text-xs text-red-500">{errors.selling_price_per_unit}</p>}
                                </FormField>

                                <FormField label="Observações" error={errors.notes}>
                                    <textarea
                                        rows={2}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Opcional..."
                                        className={inputClass(errors.notes)}
                                    />
                                </FormField>
                            </div>
                        </Card>

                        {/* Ingredients */}
                        <Card>
                            <IngredientSelector
                                items={data.ingredients}
                                ingredients={ingredients}
                                onChange={(items) => setData('ingredients', items)}
                                errors={errors}
                            />
                        </Card>
                    </div>

                    {/* Right column — cost preview */}
                    <div className="flex flex-col gap-4">
                        {totalCostPreview > 0 && (
                            <CostSummary data={costPreviewData} />
                        )}

                        <Button type="submit" icon={Save} loading={processing} size="lg" className="w-full">
                            {isEditing ? 'Salvar alterações' : 'Criar receita'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}
