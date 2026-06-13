import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Download, ChefHat } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { saveAs } from 'file-saver';
import PageHeader from '../../Components/UI/PageHeader';
import Button from '../../Components/UI/Button';
import Card, { CardHeader } from '../../Components/UI/Card';
import CostSummary from '../../Components/Recipes/CostSummary';
import { formatCurrency, formatNumber, getUnitLabel } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
    '#583c29', '#af987e', '#947c5e', '#84756d', '#6b5547',
    '#d4bfaa', '#4a3221', '#3c2819', '#c4a882', '#a08060',
];

export default function RecipeShow({ recipe, cost }) {
    const exportXlsx = async () => {
        const { utils, writeFile } = await import('xlsx-js-style');

        const rows = [
            [{ v: 'Ingrediente', s: { font: { bold: true } } }, { v: 'Unidade', s: { font: { bold: true } } }, { v: 'Qtd. usada', s: { font: { bold: true } } }, { v: 'Custo/un.', s: { font: { bold: true } } }, { v: 'Custo total', s: { font: { bold: true } } }],
            ...cost.ingredients.map((i) => [
                i.name,
                getUnitLabel(i.unit),
                formatNumber(i.quantity_used, 3),
                formatCurrency(i.cost_per_unit),
                formatCurrency(i.total_cost),
            ]),
            [],
            [{ v: 'Custo total receita', s: { font: { bold: true } } }, '', '', '', formatCurrency(cost.total_cost)],
            [{ v: 'Rendimento', s: { font: { bold: true } } }, '', '', '', `${recipe.yield_quantity} ${recipe.yield_unit}`],
            [{ v: 'Custo/unidade', s: { font: { bold: true } } }, '', '', '', formatCurrency(cost.cost_per_unit)],
            ...(cost.selling_price_per_unit !== null ? [
                [{ v: 'Preço venda/un.', s: { font: { bold: true } } }, '', '', '', formatCurrency(cost.selling_price_per_unit)],
                [{ v: 'Margem de lucro', s: { font: { bold: true } } }, '', '', '', `${cost.profit_margin_percent?.toFixed(2) ?? '—'}%`],
            ] : []),
        ];

        const ws = utils.aoa_to_sheet(rows);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'Receita');
        writeFile(wb, `${recipe.name}.xlsx`);
    };

    const pieData = {
        labels:   cost.ingredients.map((i) => i.name),
        datasets: [{
            data:            cost.ingredients.map((i) => i.total_cost),
            backgroundColor: CHART_COLORS.slice(0, cost.ingredients.length),
            borderWidth:     2,
            borderColor:     '#fff',
        }],
    };

    const pieOptions = {
        plugins: {
            legend:  { position: 'bottom', labels: { font: { size: 12 }, color: '#583c29', padding: 16 } },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${formatCurrency(ctx.parsed)} (${((ctx.parsed / cost.total_cost) * 100).toFixed(1)}%)`,
                },
            },
        },
        responsive: true,
        maintainAspectRatio: true,
    };

    return (
        <>
            <PageHeader
                title={recipe.name}
                subtitle={recipe.description}
                breadcrumbs={[
                    { href: route('recipes.index'), label: 'Receitas' },
                    { label: recipe.name },
                ]}
                action={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" icon={Download} size="sm" onClick={exportXlsx}>
                            Exportar
                        </Button>
                        <Button icon={Pencil} size="sm" onClick={() => window.location.href = route('recipes.edit', recipe.id)}>
                            Editar
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 flex flex-col gap-6">
                    <Card padding={false}>
                        <div className="p-5 border-b border-cream-200">
                            <CardHeader
                                title="Ingredientes"
                                subtitle={`${cost.ingredients.length} ingrediente${cost.ingredients.length !== 1 ? 's' : ''}`}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-cream-200 text-xs uppercase text-brown-400 tracking-wide">
                                        <th className="text-left px-5 py-3 font-medium">Ingrediente</th>
                                        <th className="text-right px-5 py-3 font-medium">Qtd. usada</th>
                                        <th className="text-right px-5 py-3 font-medium">Custo/un.</th>
                                        <th className="text-right px-5 py-3 font-medium">Custo total</th>
                                        <th className="text-right px-5 py-3 font-medium">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cost.ingredients.map((ing, i) => (
                                        <tr
                                            key={ing.id}
                                            className="border-b border-cream/60 hover:bg-cream-50/50 transition-colors"
                                        >
                                            <td className="px-5 py-3.5 font-medium text-brown-700 flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                                                />
                                                {ing.name}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-brown-600">
                                                {formatNumber(ing.quantity_used, 3)} {getUnitLabel(ing.unit)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-brown-500">
                                                {formatCurrency(ing.cost_per_unit)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-brown-700">
                                                {formatCurrency(ing.total_cost)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-brown-400">
                                                {cost.total_cost > 0
                                                    ? `${((ing.total_cost / cost.total_cost) * 100).toFixed(1)}%`
                                                    : '—'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {recipe.notes && (
                            <div className="p-5 border-t border-cream-200">
                                <p className="text-xs text-brown-400 font-medium mb-1">Observações</p>
                                <p className="text-sm text-brown-600">{recipe.notes}</p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    <CostSummary data={cost} />

                    {cost.ingredients.length > 0 && (
                        <Card>
                            <CardHeader title="Distribuição de Custos" />
                            <Pie data={pieData} options={pieOptions} />
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
