"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/form-state";
import { toFormError, toNumber, toOptionalText, toText } from "@/lib/forms";
import { movementsApi } from "./api";
import type { MovementType } from "./types";

export type MovementFormState = FormState & { savedAt?: number; summary?: string };

export async function registerMovement(_prev: MovementFormState, formData: FormData): Promise<MovementFormState> {
  const productId = toText(formData.get("productId"));

  try {
    const movement = await movementsApi.register(productId, {
      type: toText(formData.get("type")) as MovementType,
      quantity: toNumber(formData.get("quantity"), Number.NaN),
      note: toOptionalText(formData.get("note")),
    });

    // Sem redirect: continuamos na mesma página, que é re-renderizada com o novo saldo.
    revalidatePath("/", "layout");
    return {
      status: "idle",
      savedAt: Date.now(),
      summary: `Registrado. Novo saldo: ${movement.balanceAfter.toLocaleString("pt-BR")}.`,
    };
  } catch (error) {
    return toFormError(error, formData);
  }
}
