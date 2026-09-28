import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TagIcon } from "@phosphor-icons/react/ssr";
import { categoriesApi } from "@/features/categories/api";
import { ProductForm } from "@/features/products/components/product-form";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const categories = await categoriesApi.list();

  return (
    <div className="grid gap-8">
      <PageHeader title="Novo produto" description="O saldo inicial é registrado como a primeira entrada do histórico." />
      {categories.length === 0 ? (
        <EmptyState icon={<TagIcon size={28} />} title="Crie uma categoria primeiro">
          <p className="mb-4">Todo produto pertence a uma categoria.</p>
          <ButtonLink href="/categorias" variant="primary">
            Ir para categorias
          </ButtonLink>
        </EmptyState>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
