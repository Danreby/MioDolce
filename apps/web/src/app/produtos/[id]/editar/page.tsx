import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/features/categories/api";
import { updateProduct } from "@/features/products/actions";
import { ProductForm } from "@/features/products/components/product-form";
import { loadProduct } from "../load-product";

export const metadata: Metadata = { title: "Editar produto" };

export default function EditProductPage({ params }: PageProps<"/produtos/[id]/editar">) {
  return (
    <Suspense fallback={<Skeleton className="h-[480px] max-w-3xl" />}>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: { params: PageProps<"/produtos/[id]/editar">["params"] }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([loadProduct(id), getCategories()]);

  return (
    <>
      <PageHeader title={`Editar ${product.name}`} back={{ href: `/produtos/${product.id}`, label: "Voltar ao produto" }} />
      <Panel className="max-w-3xl" bodyClassName="p-6 md:p-8">
        {/* bind "amarra" o id: a action recebida pelo form já sabe qual produto editar. */}
        <ProductForm categories={categories} product={product} action={updateProduct.bind(null, product.id)} />
      </Panel>
    </>
  );
}
