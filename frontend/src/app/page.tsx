import Link from "next/link";
import { ArrowRightIcon, PackageIcon, ProhibitIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { dashboardApi } from "@/features/dashboard/api";
import { AttentionList } from "@/features/dashboard/components/attention-list";
import { CategoryValueBars } from "@/features/dashboard/components/category-value-bars";
import { FlowChart } from "@/features/dashboard/components/flow-chart";
import { MovementLedger } from "@/features/movements/components/movement-ledger";
import { formatLongDate, formatMoney } from "@/lib/format";

/**
 * Server Component assíncrono: busca os dados NO SERVIDOR e envia HTML pronto.
 * Nenhum useEffect, nenhum estado de carregamento manual: o loading.tsx cobre a espera.
 */
export default async function DashboardPage() {
  const data = await dashboardApi.get();

  if (data.activeProducts === 0) {
    return (
      <EmptyState icon={<PackageIcon size={32} />} title="Nenhum produto cadastrado ainda">
        <p className="mb-4">Cadastre o primeiro produto para ver o painel ganhar vida.</p>
        <ButtonLink href="/produtos/novo" variant="primary">
          Novo produto
        </ButtonLink>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-10">
      <section aria-label="Resumo" className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="grid gap-2 lg:col-span-7">
          <p className="text-sm text-muted">Valor em estoque em {formatLongDate(new Date())}</p>
          <p className="text-5xl font-semibold tracking-tight text-ink md:text-6xl">{formatMoney(data.inventoryValue)}</p>
          <p className="text-sm text-ink-2">
            {data.activeProducts} produtos ativos em {data.categories} categorias, pelo custo de aquisição.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:col-span-5">
          <AlertLink
            href="/produtos?status=OutOfStock"
            count={data.outOfStockCount}
            label={["produto zerado", "produtos zerados"]}
            icon={<ProhibitIcon size={18} weight="bold" className="text-danger" aria-hidden />}
          />
          <AlertLink
            href="/produtos?status=Low"
            count={data.lowStockCount}
            label={["produto abaixo do mínimo", "produtos abaixo do mínimo"]}
            icon={<WarningIcon size={18} weight="bold" className="text-warn" aria-hidden />}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <Panel title="Entradas e saídas nos últimos 14 dias" className="lg:col-span-8">
          <FlowChart data={data.dailyFlow} />
        </Panel>
        <Panel
          title="Precisa de reposição"
          className="lg:col-span-4"
          action={<PanelLink href="/produtos?sort=LowestStock">Ver todos</PanelLink>}
        >
          <AttentionList products={data.needsAttention} />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <Panel title="Valor por categoria" className="lg:col-span-5">
          <CategoryValueBars items={data.valueByCategory} />
        </Panel>
        <Panel
          title="Últimas movimentações"
          className="lg:col-span-7"
          action={<PanelLink href="/movimentacoes">Histórico completo</PanelLink>}
        >
          <MovementLedger movements={data.recentMovements} compact />
        </Panel>
      </div>
    </div>
  );
}

function AlertLink({
  href,
  count,
  label,
  icon,
}: {
  href: string;
  count: number;
  label: [singular: string, plural: string];
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="group grid gap-3 bg-surface p-5 transition-colors hover:bg-sunken/60">
      <span className="flex items-center justify-between">
        {icon}
        <ArrowRightIcon size={16} className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
      <span>
        <span className="block text-3xl font-semibold tracking-tight text-ink">{count}</span>
        <span className="text-sm text-ink-2">{count === 1 ? label[0] : label[1]}</span>
      </span>
    </Link>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-accent hover:underline">
      {children}
    </Link>
  );
}
