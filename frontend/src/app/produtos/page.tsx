import type { Metadata } from "next";
import { PackageIcon } from "@phosphor-icons/react/ssr";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SegmentedLinks } from "@/components/ui/segmented-links";
import { categoriesApi } from "@/features/categories/api";
import { productsApi } from "@/features/products/api";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductTable } from "@/features/products/components/product-table";
import { statusLabels } from "@/features/products/labels";
import { productSorts, stockStatuses } from "@/features/products/types";
import { hrefWith, readEnum, readPage, readString } from "@/lib/search-params";

export const metadata: Metadata = { title: "Produtos" };

// PageProps<"/produtos"> é gerado pelo Next a partir da estrutura de pastas.
export default async function ProductsPage({ searchParams }: PageProps<"/produtos">) {
  const params = await searchParams;
  const filters = {
    search: readString(params, "search"),
    categoryId: readString(params, "categoryId"),
    status: readEnum(params, "status", stockStatuses),
    sort: readEnum(params, "sort", productSorts),
    includeInactive: readString(params, "includeInactive") === "true",
  };

  // As duas chamadas são independentes: Promise.all dispara em paralelo (sem "cascata").
  const [result, categories] = await Promise.all([
    productsApi.list({ ...filters, page: readPage(params), pageSize: 20 }),
    categoriesApi.list(),
  ]);

  const statusOptions = [
    { label: "Todos", href: hrefWith("/produtos", params, { status: undefined, page: undefined }), active: !filters.status },
    ...stockStatuses.map((status) => ({
      label: statusLabels[status],
      href: hrefWith("/produtos", params, { status, page: undefined }),
      active: filters.status === status,
    })),
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Produtos"
        description={`${result.totalCount} ${result.totalCount === 1 ? "produto encontrado" : "produtos encontrados"}.`}
      />

      <div className="grid gap-4">
        <SegmentedLinks label="Filtrar por situação" options={statusOptions} />
        <ProductFilters categories={categories} current={filters} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState icon={<PackageIcon size={28} />} title="Nenhum produto com esses filtros">
          Limpe a busca ou escolha outra situação. Produtos arquivados só aparecem com a opção marcada.
        </EmptyState>
      ) : (
        <div>
          <ProductTable products={result.items} />
          <Pagination pathname="/produtos" params={params} data={result} />
        </div>
      )}
    </div>
  );
}
