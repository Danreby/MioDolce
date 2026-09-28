import "server-only";
import { ApiError } from "@/lib/api/client";
import type { FormState } from "@/lib/form-state";

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    // Campos internos do React/Next começam com "$ACTION"; não são dados do usuário.
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  });
  return values;
}

/** Inputs type="number" sempre enviam ponto decimal ("12.5"). Vazio → valor padrão. */
export function toNumber(value: FormDataEntryValue | null, fallback = 0): number {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  return Number(value.replace(",", "."));
}

export function toOptionalText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function toText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Converte a falha da API em estado de formulário:
 * 400 com `errors` vira erro por campo; o resto vira mensagem geral (detail do ProblemDetails).
 */
export function toFormError(error: unknown, formData: FormData): FormState {
  if (error instanceof ApiError) {
    return {
      status: "error",
      message: error.problem.errors ? "Revise os campos destacados." : error.message,
      fieldErrors: error.problem.errors,
      values: formValues(formData),
    };
  }

  // Rede fora do ar, API desligada etc.: deixa o error.tsx da rota tratar.
  throw error;
}
