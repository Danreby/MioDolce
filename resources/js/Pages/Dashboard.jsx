import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Link } from '@inertiajs/react';
import {
    Package,
    ChefHat,
    TrendingUp,
    DollarSign,
    ArrowRight,
    ShoppingBag,
} from 'lucide-react';
import PageHeader from '../Components/UI/PageHeader';
import StatCard from '../Components/UI/StatCard';
import Card, { CardHeader } from '../Components/UI/Card';
import Badge from '../Components/UI/Badge';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard({ stats, recipe_costs, recent_recipes }) {
    const barData = {
        labels:   recipe_costs.map((r) => r.name),
        datasets: [{
            label:           'Custo Total (R$)',
            data:            recipe_costs.map((r) => r.total_cost),
            backgroundColor: '#af987e',
            borderColor:     '#583c29',
            borderWidth:     1.5,
            borderRadius:    8,
            hoverBackgroundColor: '#947c5e',
        }],
    };

    const barOptions = {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
            legend:  { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`,
                },
            },
        },
        scales: {
            x: {
                grid:  { display: false },
                ticks: { color: '#84756d', font: { size: 11 }, maxRotation: 35 },
            },
            y: {
                grid:  { color: '#e6ddcf' },
                ticks: {
                    color:    '#84756d',
                    font:     { size: 11 },
                    callback: (v) => formatCurrency(v),
                },
            },
        },
    };

    const marginVariant = (m) =>
        m === null  ? 'default' :
        m >= 50     ? 'success' :
        m >= 20     ? 'warning' : 'danger';

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Visão geral dos custos e receitas"
            />

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Ingredientes"
                    value={stats.total_ingredients}
                    icon={Package}
                    color="brown"
                />
                <StatCard
                    label="Receitas"
                    value={stats.total_recipes}
                    icon={ChefHat}
                    color="cream"
                />
                <StatCard
                    label="Custo médio"
                    value={formatCurrency(stats.avg_recipe_cost)}
                    icon={TrendingUp}
                    color="success"
                />
                <StatCard
                    label="Total investido"
                    value={formatCurrency(stats.total_costs)}
                    icon={DollarSign}
                    color="warning"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Bar chart */}
                <div className="xl:col-span-2">
                    <Card>
                        <CardHeader
                            title="Custo por Receita"
                            subtitle="Top 8 receitas por custo total"
                        />
                        {recipe_costs.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-brown-300 text-sm">
                                Nenhuma receita cadastrada
                            </div>
                        ) : (
                            <div className="h-64">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        )}
                    </Card>
                </div>

                {/* Recent recipes */}
                <div>
                    <Card>
                        <CardHeader
                            title="Receitas Recentes"
                            action={
                                <Link
                                    href={route('recipes.index')}
                                    className="text-xs text-brown-400 hover:text-brown-600 flex items-center gap-1 transition-colors"
                                >
                                    Ver todas <ArrowRight size={12} />
                                </Link>
                            }
                        />

                        {recent_recipes.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <ShoppingBag size={28} className="text-brown-200 mb-2" />
                                <p className="text-sm text-brown-400">Nenhuma receita ainda</p>
                                <Link
                                    href={route('recipes.create')}
                                    className="text-xs text-brown-500 hover:text-brown-700 mt-2 underline underline-offset-2"
                                >
                                    Criar primeira receita
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recent_recipes.map((r) => (
                                    <Link
                                        key={r.id}
                                        href={route('recipes.show', r.id)}
                                        className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-brown-700 truncate group-hover:text-brown-600">
                                                {r.name}
                                            </p>
                                            <p className="text-xs text-brown-400 mt-0.5">
                                                {formatCurrency(r.total_cost)} total
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {r.profit_margin_percent !== null && (
                                                <Badge variant={marginVariant(r.profit_margin_percent)}>
                                                    {r.profit_margin_percent.toFixed(1)}%
                                                </Badge>
                                            )}
                                            <ArrowRight size={14} className="text-brown-300 group-hover:text-brown-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Most expensive */}
            {stats.most_expensive && (
                <div className="mt-6">
                    <Card>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-xs text-brown-400 mb-0.5">Receita mais cara</p>
                                <p className="text-lg font-bold text-brown-700">{stats.most_expensive.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-brown-600">{formatCurrency(stats.most_expensive.total_cost)}</p>
                                <Link
                                    href={route('recipes.show', stats.most_expensive.id)}
                                    className="text-xs text-brown-400 hover:text-brown-600 flex items-center gap-1 justify-end mt-0.5"
                                >
                                    Ver detalhes <ArrowRight size={11} />
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
