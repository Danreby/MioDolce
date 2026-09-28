"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import type { FormState } from "@/lib/form-state";
import { toFormError, toOptionalText, toText } from "@/lib/forms";
import { categoriesApi } from "./api";

/*
  Server Actions: rodam no servidor, recebem o FormData do <form> e chamam a API.
  A validação de verdade é da API (FluentValidation); aqui só convertemos os tipos
  e repassamos os erros por campo que ela devolve.
*/

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = toText(formData.get("id"));
  const body = {
    name: toText(formData.get("name")),
    description: toOptionalText(formData.get("description")),
  };

  try {
    if (id) await categoriesApi.update(id, body);
    else await categoriesApi.create(body);
  } catch (error) {
    return toFormError(error, formData);
  }

  revalidatePath("/categorias");
  // redirect lança uma exceção de controle; por isso fica FORA do try/catch.
  redirect("/categorias");
}

export async function deleteCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await categoriesApi.remove(toText(formData.get("id")));
  } catch (error) {
    if (error instanceof ApiError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/categorias");
  redirect("/categorias");
}
