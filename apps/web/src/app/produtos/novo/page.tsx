import type { Metadata } from "next";
import { Suspense } from "react";
import { TagIcon } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/features/categories/api";
import { createProduct } from "@/features/products/actions";
import { ProductForm } from "@/features/products/components/product-form";

export const metadata: Metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Novo produto" back={{ href: "/produtos", label: "Produtos" }} />
      <Panel className="max-w-3xl" bodyClassName="p-6 md:p-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Form />
        </Suspense>
      </Panel>
    </>
  );
}

async function Form() {
  const categories = await getCategories();
  if (categories.length === 0) {
    return (
      <EmptyState
        icon={TagIcon}
        title="Crie uma categoria antes"
        action={<ButtonLink href="/categorias" variant="primary">Ir para categorias</ButtonLink>}
      >
        Todo produto pertence a uma categoria.
      </EmptyState>
    );
  }
  // Server Actions podem ser passadas como prop para Client Components.
  return <ProductForm categories={categories} action={createProduct} />;
}
