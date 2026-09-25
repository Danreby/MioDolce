import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Panel } from "@/components/ui/panel";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { getMovements } from "@/features/movements/api";
import { MovementForm } from "@/features/movements/components/movement-form";
import { MovementLedger } from "@/features/movements/components/movement-ledger";
import { getProductOptions } from "@/features/products/api";
import { cn } from "@/lib/cn";
import type { MovementType } from "@/lib/types";

export const metadata: Metadata = { title: "Movimentações" };

type SearchParams = PageProps<"/movimentacoes">["searchParams"];

const TYPE_FILTERS: { value?: MovementType; label: string }[] = [
  { label: "Todas" },
  { value: "IN", label: "Entradas" },
  { value: "OUT", label: "Saídas" },
  { value: "ADJUSTMENT", label: "Ajustes" },
];

export default function MovementsPage({ searchParams }: PageProps<"/movimentacoes">) {
  return (
    <>
      <PageHeader
        title="Movimentações"
        description="Extrato do estoque. Lançamentos não são editados nem apagados: um erro se corrige com um ajuste."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <Suspense fallback={<TableSkeleton rows={10} />}>
          <Ledger searchParams={searchParams} />
        </Suspense>
        <Panel title="Nova movimentação" className="lg:sticky lg:top-10">
          <Suspense fallback={<Skeleton className="h-80" />}>
            <NewMovement />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}

async function NewMovement() {
  const products = await getProductOptions();
  return <MovementForm products={products} />;
}

async function Ledger({ searchParams }: { searchParams: SearchParams }) {
  const params = (await searchParams) as Record<string, string | undefined>;
  const type = TYPE_FILTERS.some((f) => f.value === params.type) ? (params.type as MovementType) : undefined;
  const { data, meta } = await getMovements({ type, page: params.page });

  return (
    <div className="min-w-0">
      {/* Filtros como links: cada estado tem sua própria URL. */}
      <nav aria-label="Filtrar por tipo" className="mb-4 flex gap-1">
        {TYPE_FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/movimentacoes?type=${f.value}` : "/movimentacoes"}
            aria-current={type === f.value ? "page" : undefined}
            className={cn(
              "rounded-xs px-3 py-1.5 text-sm",
              type === f.value ? "bg-ink text-panel font-medium" : "text-ink-2 hover:bg-sunken hover:text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {data.length === 0 ? (
        <EmptyState icon={ClockCounterClockwiseIcon} title="Nenhuma movimentação encontrada">
          Registre uma entrada no formulário ao lado.
        </EmptyState>
      ) : (
        <div className="border-line bg-panel rounded-xs border px-5 py-2">
          <MovementLedger movements={data} />
        </div>
      )}
      <Pagination meta={meta} searchParams={{ type }} pathname="/movimentacoes" />
    </div>
  );
}
