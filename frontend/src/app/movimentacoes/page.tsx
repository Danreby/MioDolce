import type { Metadata } from "next";
import Link from "next/link";
import { ClockCounterClockwiseIcon, XIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SegmentedLinks } from "@/components/ui/segmented-links";
import { movementsApi } from "@/features/movements/api";
import { MovementLedger } from "@/features/movements/components/movement-ledger";
import { movementLabels } from "@/features/movements/labels";
import { movementTypes } from "@/features/movements/types";
import { loadProduct } from "@/features/products/load-product";
import { hrefWith, readEnum, readPage, readString } from "@/lib/search-params";

export const metadata: Metadata = { title: "Movimentações" };

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export default async function MovementsPage({ searchParams }: PageProps<"/movimentacoes">) {
  const params = await searchParams;
  const productId = readString(params, "productId");
  const type = readEnum(params, "type", movementTypes);
  const from = readString(params, "from");
  const to = readString(params, "to");

  const [result, product] = await Promise.all([
    movementsApi.list({
      productId,
      type,
      // O banco guarda UTC; para um projeto de estudo, tratar o dia inteiro em UTC é suficiente.
      fromUtc: from && isoDate.test(from) ? `${from}T00:00:00` : undefined,
      toUtc: to && isoDate.test(to) ? `${to}T23:59:59` : undefined,
      page: readPage(params),
      pageSize: 25,
    }),
    productId ? loadProduct(productId) : Promise.resolve(null),
  ]);

  const typeOptions = [
    { label: "Todas", href: hrefWith("/movimentacoes", params, { type: undefined, page: undefined }), active: !type },
    ...movementTypes.map((option) => ({
      label: movementLabels[option],
      href: hrefWith("/movimentacoes", params, { type: option, page: undefined }),
      active: type === option,
    })),
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Movimentações"
        description="Livro-razão do estoque. Registros não são editados nem apagados: correções entram como ajuste."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedLinks label="Filtrar por tipo" options={typeOptions} />
          {product ? (
            <Link
              href={hrefWith("/movimentacoes", params, { productId: undefined, page: undefined })}
              className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1 text-sm text-ink-2 hover:text-ink"
            >
              {product.name}
              <XIcon size={14} aria-label="Remover filtro de produto" />
            </Link>
          ) : null}
        </div>

        <form className="flex flex-wrap items-end gap-2">
          {productId ? <input type="hidden" name="productId" value={productId} /> : null}
          {type ? <input type="hidden" name="type" value={type} /> : null}
          <label className="grid gap-1 text-xs text-muted">
            De
            <Input type="date" name="from" defaultValue={from} className="w-40" />
          </label>
          <label className="grid gap-1 text-xs text-muted">
            Até
            <Input type="date" name="to" defaultValue={to} className="w-40" />
          </label>
          <Button type="submit">Filtrar período</Button>
        </form>
      </div>

      {result.items.length === 0 ? (
        <EmptyState icon={<ClockCounterClockwiseIcon size={28} />} title="Nenhuma movimentação no filtro atual">
          Ajuste o período ou o tipo. Movimentações são registradas na página de cada produto.
        </EmptyState>
      ) : (
        <div>
          <MovementLedger movements={result.items} showProduct={!product} />
          <Pagination pathname="/movimentacoes" params={params} data={result} />
        </div>
      )}
    </div>
  );
}
