import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { productsApi } from "./api";

/**
 * cache() do React deduplica chamadas na MESMA renderização: generateMetadata e a página
 * pedem o mesmo produto, mas a API é chamada uma vez só. 404 da API vira a página not-found.
 */
export const loadProduct = cache(async (id: string) => {
  try {
    return await productsApi.get(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
