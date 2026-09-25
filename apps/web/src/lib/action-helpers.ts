import "server-only";
import type { z } from "zod";
import { ApiError } from "./api-client";
import type { ActionState } from "./action-state";

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  });
  return values;
}

export function validationError(error: z.ZodError, values: Record<string, string>): ActionState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { status: "error", message: "Revise os campos destacados.", fieldErrors, values };
}

/** Converte erros da API em estado de formulário; qualquer outro erro sobe para o error.tsx. */
export function apiError(error: unknown, values?: Record<string, string>): ActionState {
  if (error instanceof ApiError) return { status: "error", message: error.message, values };
  throw error;
}
