import Link from "next/link";
import { Suspense } from "react";
import { PackageIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard } from "@/features/dashboard/api";
import { FlowChart } from "@/features/dashboard/components/flow-chart";
import { RestockList } from "@/features/dashboard/components/restock-list";
import { TotalsStrip } from "@/features/dashboard/components/totals-strip";
import { MovementLedger } from "@/features/movements/components/movement-ledger";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Painel"
        description="Situação do estoque agora e o que entrou e saiu nas últimas duas semanas."
        actions={
          <ButtonLink href="/movimentacoes" variant="primary">
            <PlusIcon size={16} weight="bold" />
            Lançar movimentação
          </ButtonLink>
        }
      />
      {/* O cabeçalho sai imediatamente; os dados chegam por streaming. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  const { totals, flow, lowStockItems, recentMovements } = await getDashboard();

  if (totals.products === 0) {
    return (
      <EmptyState
        icon={PackageIcon}
        title="O estoque está vazio"
        action={<ButtonLink href="/produtos/novo" variant="primary">Cadastrar produto</ButtonLink>}
      >
        Cadastre produtos (ou rode npm run db:seed) para ver os números aqui.
      </EmptyState>
    );
  }

  return (
    <>
      <TotalsStrip totals={totals} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Panel title="Entradas e saídas por dia, em unidades (14 dias)">
          <FlowChart flow={flow} />
        </Panel>
        <Panel title="Repor" aside={<Link href="/produtos?status=low" className="text-muted hover:text-ink text-xs">Ver todos</Link>}>
          <RestockList items={lowStockItems} />
        </Panel>
      </div>
      <Panel
        title="Últimas movimentações"
        className="mt-6"
        aside={<Link href="/movimentacoes" className="text-muted hover:text-ink text-xs">Histórico completo</Link>}
      >
        <MovementLedger movements={recentMovements} />
      </Panel>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Carregando painel">
      <div className="border-line mb-8 grid grid-cols-2 gap-6 border-y py-6 lg:grid-cols-4">
        <Skeleton className="col-span-2 h-14 lg:col-span-1" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
