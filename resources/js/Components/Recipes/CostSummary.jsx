import { formatCurrency, getUnitLabel } from '../../utils/formatters';
import Card, { CardHeader } from '../UI/Card';
import Badge from '../UI/Badge';

export default function CostSummary({ data }) {
    const {
        total_cost,
        cost_per_unit,
        yield_quantity,
        selling_price_per_unit,
        profit_per_unit,
        profit_total,
        profit_margin_percent,
    } = data;

    const marginVariant =
        profit_margin_percent === null ? 'default' :
        profit_margin_percent >= 50   ? 'success' :
        profit_margin_percent >= 20   ? 'warning' :
                                        'danger';

    const rows = [
        { label: 'Custo total da receita', value: formatCurrency(total_cost),       highlight: false },
        { label: 'Custo por unidade',      value: formatCurrency(cost_per_unit),    highlight: false },
        ...(selling_price_per_unit !== null ? [
            { label: 'Preço de venda/un.',  value: formatCurrency(selling_price_per_unit), highlight: false },
            { label: 'Lucro por unidade',   value: formatCurrency(profit_per_unit),        highlight: profit_per_unit > 0 },
            { label: 'Lucro total',         value: formatCurrency(profit_total),           highlight: profit_total > 0 },
        ] : []),
    ];

    return (
        <Card>
            <CardHeader title="Resumo de Custos" />
            <div className="space-y-3">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-brown-500">{row.label}</span>
                        <span className={`text-sm font-semibold ${row.highlight ? 'text-emerald-600' : 'text-brown-700'}`}>
                            {row.value}
                        </span>
                    </div>
                ))}
                {profit_margin_percent !== null && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-cream">
                        <span className="text-sm text-brown-500">Margem de lucro</span>
                        <Badge variant={marginVariant} className="text-xs">
                            {profit_margin_percent.toFixed(2)}%
                        </Badge>
                    </div>
                )}
            </div>
        </Card>
    );
}
