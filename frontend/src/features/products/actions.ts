"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import type { FormState } from "@/lib/form-state";
import { toFormError, toNumber, toOptionalText, toText } from "@/lib/forms";
import { productsApi } from "./api";
import type { ProductDetails, UnitOfMeasure } from "./types";

function readDetails(formData: FormData): ProductDetails {
  return {
    name: toText(formData.get("name")),
    description: toOptionalText(formData.get("description")),
    categoryId: toText(formData.get("categoryId")),
    unit: toText(formData.get("unit")) as UnitOfMeasure,
    unitCost: toNumber(formData.get("unitCost")),
    minimumStock: toNumber(formData.get("minimumStock")),
  };
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  let id: string;
  try {
    const product = await productsApi.create({
      ...readDetails(formData),
      sku: toText(formData.get("sku")),
      initialQuantity: toNumber(formData.get("initialQuantity")),
    });
    id = product.id;
  } catch (error) {
    return toFormError(error, formData);
  }

  revalidatePath("/", "layout");
  redirect(`/produtos/${id}`);
}

export async function updateProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = toText(formData.get("id"));
  try {
    await productsApi.update(id, {
      ...readDetails(formData),
      isActive: formData.get("isActive") === "on",
    });
  } catch (error) {
    return toFormError(error, formData);
  }

  revalidatePath("/", "layout");
  redirect(`/produtos/${id}`);
}

export async function deleteProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await productsApi.remove(toText(formData.get("id")));
  } catch (error) {
    if (error instanceof ApiError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/produtos");
}
