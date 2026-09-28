import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveIcon, ClockCounterClockwiseIcon, PencilSimpleIcon } from "@phosphor-icons/react/ssr";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { movementsApi } from "@/features/movements/api";
import { MovementForm } from "@/features/movements/components/movement-form";
import { MovementLedger } from "@/features/movements/components/movement-ledger";
import { StockMeter } from "@/features/products/components/stock-meter";
import { StockStatusBadge } from "@/features/products/components/stock-status";
import { unitLabels } from "@/features/products/labels";
import { loadProduct } from "@/features/products/load-product";
import { formatDateTime, formatMoney, formatQuantity, unitShort } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/produtos/[id]">): Promise<Metadata> {
  const product = await loadProduct((await params).id);
  return { title: product.name };
}

export default async function ProductPage({ params }: PageProps<"/produtos/[id]">) {
  const { id } = await params;
  const [product, history] = await Promise.all([loadProduct(id), movementsApi.list({ productId: id, pageSize: 30 })]);
  const unit = unitShort[product.unit];

  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-1.5">
          <p className="text-sm text-muted">
            <span className="font-mono text-ink-2">{product.sku}</span>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <Link href={`/produtos?categoryId=${product.categoryId}`} className="hover:underline">
              {product.categoryName}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{product.name}</h1>
          {product.description ? <p className="max-w-[65ch] text-sm text-ink-2">{product.description}</p> : null}
        </div>
        <ButtonLink href={`/produtos/${product.id}/editar`}>
          <PencilSimpleIcon size={16} aria-hidden />
          Editar
        </ButtonLink>
      </header>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="grid content-start gap-8 lg:col-span-4">
          <section aria-label="Saldo" className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Saldo atual</p>
              <StockStatusBadge status={product.status} archived={!product.isActive} />
            </div>
            <p className="text-5xl font-semibold tracking-tight">
              {formatQuantity(product.quantityOnHand)}
              <span className="ml-2 text-2xl font-normal text-muted">{unit}</span>
            </p>
            <StockMeter quantity={product.quantityOnHand} minimum={product.minimumStock} status={product.status} />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2 text-sm">
              <Fact label="Estoque mínimo" value={`${formatQuantity(product.minimumStock)} ${unit}`} />
              <Fact label="Unidade" value={unitLabels[product.unit]} />
              <Fact label="Custo unitário" value={formatMoney(product.unitCost)} />
              <Fact label="Valor em estoque" value={formatMoney(product.stockValue)} />
              <Fact label="Cadastrado em" value={formatDateTime(product.createdAtUtc)} />
              <Fact label="Última alteração" value={product.updatedAtUtc ? formatDateTime(product.updatedAtUtc) : "Nunca"} />
            </dl>
          </section>

          <Panel title="Registrar movimentação">
            {product.isActive ? (
              <MovementForm productId={product.id} unitLabel={unit} />
            ) : (
              <p className="flex items-start gap-2 text-sm text-ink-2">
                <ArchiveIcon size={18} className="mt-px shrink-0 text-muted" aria-hidden />
                Produto arquivado. Reative-o na edição para voltar a movimentar.
              </p>
            )}
          </Panel>
        </div>

        <Panel
          title="Histórico"
          className="lg:col-span-8"
          action={
            history.totalCount > history.items.length ? (
              <Link href={`/movimentacoes?productId=${product.id}`} className="text-sm text-accent hover:underline">
                Ver todas as {history.totalCount}
              </Link>
            ) : null
          }
        >
          {history.items.length === 0 ? (
            <EmptyState icon={<ClockCounterClockwiseIcon size={28} />} title="Nenhuma movimentação ainda">
              Registre uma entrada ao lado para começar o histórico deste produto.
            </EmptyState>
          ) : (
            <MovementLedger movements={history.items} showProduct={false} />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular text-ink">{value}</dd>
    </div>
  );
}
