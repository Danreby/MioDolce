import type { Metadata } from "next";
import Link from "next/link";
import { PencilSimpleIcon, TagIcon } from "@phosphor-icons/react/ssr";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { categoriesApi } from "@/features/categories/api";
import { CategoryForm } from "@/features/categories/components/category-form";
import { DeleteCategoryButton } from "@/features/categories/components/delete-category-button";
import { readString } from "@/lib/search-params";

export const metadata: Metadata = { title: "Categorias" };

/** A categoria em edição vem da URL (?editar=id): sem modal, sem estado global. */
export default async function CategoriesPage({ searchParams }: PageProps<"/categorias">) {
  const params = await searchParams;
  const categories = await categoriesApi.list();
  const editing = categories.find((category) => category.id === readString(params, "editar"));

  return (
    <div className="grid gap-8">
      <PageHeader title="Categorias" description="Agrupam os produtos. Só é possível excluir uma categoria vazia." />

      <div className="grid gap-8 lg:grid-cols-12">
        <section aria-label="Lista de categorias" className="lg:col-span-7">
          {categories.length === 0 ? (
            <EmptyState icon={<TagIcon size={28} />} title="Nenhuma categoria">
              Crie a primeira no formulário ao lado.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className={`flex items-start justify-between gap-4 py-4 ${editing?.id === category.id ? "bg-accent-soft/50" : ""}`}
                >
                  <div className="grid min-w-0 gap-1">
                    <Link href={`/produtos?categoryId=${category.id}`} className="font-medium text-ink hover:underline">
                      {category.name}
                    </Link>
                    {category.description ? <p className="text-sm text-ink-2">{category.description}</p> : null}
                    <p className="text-xs text-muted">
                      {category.productCount} {category.productCount === 1 ? "produto" : "produtos"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    <Link
                      href={`/categorias?editar=${category.id}`}
                      aria-label={`Editar ${category.name}`}
                      className="inline-flex h-8 items-center rounded-md px-2 text-ink-2 hover:bg-sunken hover:text-ink"
                    >
                      <PencilSimpleIcon size={16} aria-hidden />
                    </Link>
                    <DeleteCategoryButton id={category.id} name={category.name} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Panel title={editing ? `Editar "${editing.name}"` : "Nova categoria"} className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          {/* key: trocar a categoria editada recria o formulário (e zera o estado do useActionState). */}
          <CategoryForm key={editing?.id ?? "new"} category={editing} />
        </Panel>
      </div>
    </div>
  );
}
