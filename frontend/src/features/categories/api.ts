import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { Category, CategoryRequest } from "./types";

// Uma função por endpoint: as páginas nunca montam URLs da API diretamente.
export const categoriesApi = {
  list: () => apiFetch<Category[]>("/api/categories"),
  get: (id: string) => apiFetch<Category>(`/api/categories/${id}`),
  create: (body: CategoryRequest) => apiFetch<Category>("/api/categories", { method: "POST", body }),
  update: (id: string, body: CategoryRequest) => apiFetch<Category>(`/api/categories/${id}`, { method: "PUT", body }),
  remove: (id: string) => apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }),
};
