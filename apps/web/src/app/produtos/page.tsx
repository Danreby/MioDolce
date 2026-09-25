import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { MagnifyingGlassIcon, PackageIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/features/categories/api";
import { getProducts } from "@/features/products/api";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductTable } from "@/features/products/components/product-table";
import type { StockStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Produtos" };

type SearchParams = PageProps<"/produtos">["searchParams"];

export default function ProductsPage({ searchParams }: PageProps<"/produtos">) {
  return (
    <>
      <PageHeader
        title="Produtos"
        description="Saldo atual de cada item. Clique em um produto para ver o histórico e lançar movimentações."
        actions={
          <ButtonLink href="/produtos/novo" variant="primary">
            <PlusIcon size={16} weight="bold" />
            Novo produto
          </ButtonLink>
        }
      />
      {/* Cada bloco carrega de forma independente (streaming). */}
      <Suspense fallback={<Skeleton className="mb-4 h-10" />}>
        <Filters />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Filters() {
  // connection() declara "renderize na requisição". Sem isso o Next tenta
  // prerenderizar este bloco no build, e o cache curto de categorias
  // (expire < 5 min) não pode entrar no HTML estático.
  await connection();
  const categories = await getCategories();
  return <ProductFilters categories={categories} />;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const params = (await searchParams) as Record<string, string | undefined>;
  const { data, meta } = await getProducts({
    search: params.search,
    categoryId: params.categoryId,
    status: params.status as StockStatus | undefined,
    archived: params.archived === "true",
    page: params.page,
  });

  if (data.length === 0) {
    const filtered = Boolean(params.search || params.categoryId || params.status || params.archived);
    return filtered ? (
      <EmptyState icon={MagnifyingGlassIcon} title="Nenhum produto com esses filtros">
        Tente outro termo de busca ou limpe os filtros acima.
      </EmptyState>
    ) : (
      <EmptyState
        icon={PackageIcon}
        title="Nenhum produto cadastrado"
        action={<ButtonLink href="/produtos/novo" variant="primary">Cadastrar o primeiro</ButtonLink>}
      >
        Cadastre um produto com saldo inicial e ele já aparece no painel.
      </EmptyState>
    );
  }

  return (
    <>
      <ProductTable products={data} />
      <Pagination meta={meta} searchParams={params} pathname="/produtos" />
    </>
  );
}
