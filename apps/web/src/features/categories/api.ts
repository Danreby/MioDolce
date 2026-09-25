import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/lib/api-client";
import type { Category } from "@/lib/types";

export const CATEGORIES_TAG = "categories";

/**
 * Categorias mudam pouco e aparecem em várias telas (filtros, formulários),
 * então são o exemplo de dado cacheado do projeto:
 * - 'use cache' guarda o resultado no servidor;
 * - cacheTag permite invalidar sob demanda com updateTag(CATEGORIES_TAG);
 * - cacheLife com expire < 5 min faz o Next tratar como "dinâmico curto":
 *   não entra no HTML gerado no build, então o build não depende da API no ar.
 */
export async function getCategories() {
  "use cache";
  cacheTag(CATEGORIES_TAG);
  cacheLife({ stale: 30, revalidate: 60, expire: 120 });
  return api<Category[]>("/categories");
}

export function getCategory(id: number) {
  return api<Category>(`/categories/${id}`);
}
