import "server-only";
import { api } from "@/lib/api-client";
import type { Paginated, Product, StockStatus } from "@/lib/types";

// Dados de estoque mudam o tempo todo: sem 'use cache', sempre frescos.

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  status?: StockStatus;
  archived?: boolean;
  page?: string;
  pageSize?: number;
}

export function getProducts(query: ProductQuery = {}) {
  return api<Paginated<Product>>("/products", { query: { pageSize: 15, ...query } });
}

export function getProduct(id: number) {
  return api<Product>(`/products/${id}`);
}

/** Lista enxuta para selects (ex.: formulário de movimentação). */
export async function getProductOptions() {
  const { data } = await api<Paginated<Product>>("/products", { query: { pageSize: 100 } });
  return data.map(({ id, sku, name, unit, quantity }) => ({ id, sku, name, unit, quantity }));
}

export type ProductOption = Awaited<ReturnType<typeof getProductOptions>>[number];
