"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api-client";
import { apiError, formValues, validationError } from "@/lib/action-helpers";
import type { ActionState } from "@/lib/action-state";
import { CATEGORIES_TAG } from "./api";
import { categorySchema } from "./schemas";

/**
 * Server Actions: funções que rodam no servidor, chamadas direto pelo <form>.
 * Recebem (estadoAnterior, formData) por causa do useActionState.
 * `id` vem primeiro porque é "amarrado" com .bind(null, id) no componente.
 */
export async function saveCategory(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData);
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    if (id) await api(`/categories/${id}`, { method: "PATCH", body: parsed.data });
    else await api("/categories", { method: "POST", body: parsed.data });
  } catch (error) {
    return apiError(error, values);
  }

  // Expira o cache de categorias: a próxima leitura já vem atualizada.
  updateTag(CATEGORIES_TAG);
  if (id) redirect("/categorias");
  return { status: "success", message: `Categoria "${parsed.data.name}" criada.` };
}

export async function deleteCategory(id: number, _prev: ActionState): Promise<ActionState> {
  try {
    await api(`/categories/${id}`, { method: "DELETE" });
  } catch (error) {
    return apiError(error);
  }
  updateTag(CATEGORIES_TAG);
  return { status: "success" };
}
