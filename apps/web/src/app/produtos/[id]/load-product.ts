import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getProduct } from "@/features/products/api";
import { ApiError } from "@/lib/api-client";

/**
 * Busca o produto ou mostra o not-found.tsx. `cache` do React deduplica
 * chamadas com o mesmo id dentro de uma mesma requisição.
 */
export const loadProduct = cache(async (rawId: string) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
