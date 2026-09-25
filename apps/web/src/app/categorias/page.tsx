import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PencilSimpleIcon, TagIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/features/categories/api";
import { CategoryForm } from "@/features/categories/components/category-form";
import { DeleteCategoryButton } from "@/features/categories/components/delete-category-button";
import { formatInt } from "@/lib/format";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage({ searchParams }: PageProps<"/categorias">) {
  return (
    <>
      <PageHeader title="Categorias" description="Agrupam os produtos nos filtros e relatórios." />
      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/**
 * `searchParams` é uma Promise no Next 16. Ela é lida aqui, dentro do
 * <Suspense>, para o resto da página (cabeçalho) sair na hora.
 * ?editar=3 coloca o formulário da direita em modo de edição.
 */
async function Categories({ searchParams }: { searchParams: PageProps<"/categorias">["searchParams"] }) {
  const { editar } = await searchParams;
  const categories = await getCategories();
  const editing = categories.find((c) => String(c.id) === editar);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      {categories.length === 0 ? (
        <EmptyState icon={TagIcon} title="Nenhuma categoria ainda">
          Crie a primeira categoria ao lado. Todo produto precisa pertencer a uma.
        </EmptyState>
      ) : (
        <ul className="border-line bg-panel divide-line divide-y rounded-xs border">
          {categories.map((category) => {
            const count = category._count?.products ?? 0;
            return (
              <li key={category.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/produtos?categoryId=${category.id}`} className="font-semibold hover:underline">
                    {category.name}
                  </Link>
                  {category.description && <p className="text-ink-2 mt-0.5 text-sm">{category.description}</p>}
                </div>
                <span className="text-muted tabular pt-0.5 text-sm whitespace-nowrap">
                  {formatInt(count)} {count === 1 ? "produto" : "produtos"}
                </span>
                <div className="flex items-start gap-1">
                  <Link
                    href={`/categorias?editar=${category.id}`}
                    className={buttonClass({ variant: "ghost", size: "sm" })}
                    aria-label={`Editar ${category.name}`}
                  >
                    <PencilSimpleIcon size={16} />
                  </Link>
                  <DeleteCategoryButton id={category.id} name={category.name} disabled={count > 0} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Panel title={editing ? `Editar "${editing.name}"` : "Nova categoria"} className="lg:sticky lg:top-10">
        {/* key troca o form inteiro ao alternar entre criar e editar */}
        <CategoryForm key={editing?.id ?? "new"} category={editing} />
      </Panel>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="border-line bg-panel rounded-xs border">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border-line flex gap-4 border-b px-5 py-5 last:border-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
