import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { PagedResponse } from "@/lib/api/types";
import type { CreateProductRequest, Product, ProductListQuery, UpdateProductRequest } from "./types";

export const productsApi = {
  list: (query: ProductListQuery) => apiFetch<PagedResponse<Product>>("/api/products", { query }),
  get: (id: string) => apiFetch<Product>(`/api/products/${id}`),
  create: (body: CreateProductRequest) => apiFetch<Product>("/api/products", { method: "POST", body }),
  update: (id: string, body: UpdateProductRequest) => apiFetch<Product>(`/api/products/${id}`, { method: "PUT", body }),
  remove: (id: string) => apiFetch<void>(`/api/products/${id}`, { method: "DELETE" }),
};
