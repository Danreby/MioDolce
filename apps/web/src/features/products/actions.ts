"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api-client";
import { apiError, formValues, validationError } from "@/lib/action-helpers";
import type { ActionState } from "@/lib/action-state";
import type { Product } from "@/lib/types";
import { CATEGORIES_TAG } from "../categories/api";
import { productSchema } from "./schemas";

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData);
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  let product: Product;
  try {
    product = await api<Product>("/products", { method: "POST", body: parsed.data });
  } catch (error) {
    return apiError(error, values);
  }

  // A contagem de produtos por categoria mudou.
  updateTag(CATEGORIES_TAG);
  // redirect() lança uma exceção especial, por isso fica fora do try/catch.
  redirect(`/produtos/${product.id}`);
}

export async function updateProduct(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData);
  // Na edição o saldo inicial não existe: o saldo só muda por movimentações.
  const parsed = productSchema.omit({ initialQuantity: true }).safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    await api(`/products/${id}`, { method: "PATCH", body: parsed.data });
  } catch (error) {
    return apiError(error, values);
  }

  updateTag(CATEGORIES_TAG);
  redirect(`/produtos/${id}`);
}

export async function setProductActive(id: number, active: boolean): Promise<ActionState> {
  try {
    await api(`/products/${id}`, { method: "PATCH", body: { active } });
  } catch (error) {
    return apiError(error);
  }
  // Os dados de produto não são cacheados; refresh() re-renderiza a página atual com dados novos.
  refresh();
  return { status: "success" };
}

export async function deleteProduct(id: number, _prev: ActionState): Promise<ActionState> {
  try {
    await api(`/products/${id}`, { method: "DELETE" });
  } catch (error) {
    return apiError(error);
  }
  updateTag(CATEGORIES_TAG);
  redirect("/produtos");
}
