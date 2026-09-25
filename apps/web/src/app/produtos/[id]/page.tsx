import { Suspense } from "react";
import { ClockCounterClockwiseIcon, PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Panel } from "@/components/ui/panel";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Sku } from "@/components/ui/sku";
import { getMovements } from "@/features/movements/api";
import { MovementForm } from "@/features/movements/components/movement-form";
import { MovementLedger } from "@/features/movements/components/movement-ledger";
import { ArchiveProductButton, DeleteProductButton } from "@/features/products/components/product-actions";
import { StockBadge } from "@/features/products/components/stock-badge";
import { StockLevel } from "@/features/products/components/stock-level";
import { formatInt, formatMoney, UNIT_LABEL } from "@/lib/format";
import { loadProduct } from "./load-product";

type Props = PageProps<"/produtos/[id]">;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await loadProduct(id);
  return { title: product.name };
}

export default function ProductPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductDetail({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const [product, history] = await Promise.all([
    loadProduct(id),
    getMovements({ productId: Number(id), page: page as string | undefined, pageSize: 12 }),
  ]);
  const unit = UNIT_LABEL[product.unit];

  return (
    <>
      <PageHeader
        back={{ href: "/produtos", label: "Produtos" }}
        title={
          <span className="flex flex-col items-start gap-2">
            <Sku className="text-xs">{product.sku}</Sku>
            {product.name}
          </span>
        }
        description={
          <>
            {product.category.name}
            {!product.active && <strong className="text-ink ml-2">Arquivado: não aceita movimentações.</strong>}
          </>
        }
        actions={
          <>
            <ButtonLink href={`/produtos/${product.id}/editar`}>
              <PencilSimpleIcon size={16} />
              Editar
            </ButtonLink>
            <ArchiveProductButton id={product.id} active={product.active} />
            {history.meta.total === 0 && <DeleteProductButton id={product.id} name={product.name} />}
          </>
        }
      />

      {/* Números principais, separados por linhas finas em vez de cartões. */}
      <dl className="border-line mb-8 grid grid-cols-2 gap-y-6 border-y py-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1 md:pr-6">
          <dt className="text-muted text-xs">Saldo atual</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight">{formatInt(product.quantity)}</span>
            <span className="text-muted">{unit}</span>
            <StockBadge quantity={product.quantity} minQuantity={product.minQuantity} className="ml-1 self-center" />
          </dd>
          <StockLevel quantity={product.quantity} minQuantity={product.minQuantity} className="mt-3 max-w-72" />
        </div>
        <Stat label="Estoque mínimo" value={`${formatInt(product.minQuantity)} ${unit}`} />
        <Stat label="Custo / venda" value={`${formatMoney(product.costPrice)}`} sub={`venda ${formatMoney(product.salePrice)}`} />
        <Stat label="Valor em estoque" value={formatMoney(product.quantity * Number(product.costPrice))} sub="pelo custo" />
      </dl>

      {product.description && <p className="text-ink-2 mb-8 max-w-[65ch] text-sm">{product.description}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <Panel title="Histórico" aside={<span className="text-muted tabular text-xs">{history.meta.total} lançamentos</span>}>
          {history.data.length === 0 ? (
            <EmptyState icon={ClockCounterClockwiseIcon} title="Sem movimentações">
              Registre a primeira entrada ao lado.
            </EmptyState>
          ) : (
            <>
              <MovementLedger movements={history.data} hideProduct />
              <Pagination meta={history.meta} searchParams={{}} pathname={`/produtos/${product.id}`} />
            </>
          )}
        </Panel>

        {product.active && (
          <Panel title="Registrar movimentação" className="lg:sticky lg:top-10">
            <MovementForm product={product} />
          </Panel>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-line md:border-l md:pl-6">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd>
      {sub && <dd className="text-muted text-xs">{sub}</dd>}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div role="status" aria-label="Carregando produto">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-8 h-10 w-96 max-w-full" />
      <Skeleton className="mb-8 h-28" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <TableSkeleton rows={6} />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
