import Link from "next/link";
import { formatInt, formatMoney } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";

/**
 * Faixa de totais. Um número de destaque (valor do estoque) e os demais
 * menores, separados por linhas finas: sem grade de cartões iguais.
 */
export function TotalsStrip({ totals }: { totals: DashboardSummary["totals"] }) {
  const attention = totals.lowStock + totals.outOfStock;

  return (
    <dl className="border-line mb-8 grid grid-cols-2 gap-y-6 border-y py-6 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
      <div className="col-span-2 lg:col-span-1 lg:pr-8">
        <dt className="text-muted text-xs">Valor em estoque, pelo custo</dt>
        <dd className="mt-1 text-5xl font-semibold tracking-tight">{formatMoney(totals.inventoryValue)}</dd>
      </div>
      <Stat label="Unidades em estoque" value={formatInt(totals.units)} />
      <Stat label="Produtos ativos" value={formatInt(totals.products)} />
      <div className="border-line col-span-2 lg:col-span-1 lg:border-l lg:pl-6">
        <dt className="text-muted text-xs">Precisam de reposição</dt>
        <dd className="mt-1 flex items-baseline gap-3">
          <span className="text-3xl font-semibold">{formatInt(attention)}</span>
          {attention > 0 && (
            <Link href="/produtos?status=low" className="text-ink-2 text-sm underline-offset-2 hover:underline">
              {totals.outOfStock > 0 ? `${totals.outOfStock} zerado(s), ` : ""}
              {totals.lowStock} baixo(s)
            </Link>
          )}
        </dd>
      </div>
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line lg:border-l lg:pl-6">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold">{value}</dd>
    </div>
  );
}
