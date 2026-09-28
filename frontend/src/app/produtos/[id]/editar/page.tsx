import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { categoriesApi } from "@/features/categories/api";
import { DeleteProductForm } from "@/features/products/components/delete-product-form";
import { ProductForm } from "@/features/products/components/product-form";
import { loadProduct } from "@/features/products/load-product";

export async function generateMetadata({ params }: PageProps<"/produtos/[id]/editar">): Promise<Metadata> {
  const product = await loadProduct((await params).id);
  return { title: `Editar ${product.name}` };
}

export default async function EditProductPage({ params }: PageProps<"/produtos/[id]/editar">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([loadProduct(id), categoriesApi.list()]);

  return (
    <div className="grid gap-8">
      <PageHeader title={`Editar ${product.name}`} description="O saldo não é editado aqui: ele só muda por movimentação." />
      <ProductForm categories={categories} product={product} />
      <DeleteProductForm productId={product.id} />
    </div>
  );
}
