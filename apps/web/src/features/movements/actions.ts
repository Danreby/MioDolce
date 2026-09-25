"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api-client";
import { apiError, formValues, validationError } from "@/lib/action-helpers";
import type { ActionState } from "@/lib/action-state";
import { formatDelta, MOVEMENT_LABEL, UNIT_LABEL } from "@/lib/format";
import type { StockMovement } from "@/lib/types";
import { movementSchema } from "./schemas";

export async function createMovement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData);
  const parsed = movementSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  let movement: StockMovement;
  try {
    movement = await api<StockMovement>("/stock-movements", { method: "POST", body: parsed.data });
  } catch (error) {
    // Ex.: 422 "Saldo insuficiente" vindo da regra de negócio da API.
    return apiError(error, values);
  }

  // Saldo, histórico e painel mudaram: re-renderiza a página atual com dados novos.
  refresh();
  const unit = UNIT_LABEL[movement.product.unit];
  return {
    status: "success",
    message: `${MOVEMENT_LABEL[movement.type]} registrada: ${formatDelta(movement.delta)} ${unit}. Novo saldo de ${movement.product.name}: ${movement.balanceAfter} ${unit}.`,
    // Mantém o produto selecionado para lançar vários movimentos seguidos.
    values: { productId: values.productId, type: values.type },
  };
}
