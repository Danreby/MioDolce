import { z } from "zod";

/*
 * Campos de formulário chegam sempre como string. Estes helpers convertem
 * para número tratando o campo vazio como "não preenchido" (e não como 0,
 * que é o que Number("") retornaria).
 */

export const requiredNumber = (message: string) =>
  z.string().trim().min(1, message).pipe(z.coerce.number<string>({ error: "Número inválido" }));

export const requiredInt = (message: string) =>
  requiredNumber(message).pipe(z.number().int("Use um número inteiro").min(0, "Não pode ser negativo"));

export const optionalInt = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .pipe(z.number({ error: "Número inválido" }).int("Use um número inteiro").min(0, "Não pode ser negativo").optional());

/** Texto opcional: string vazia vira undefined (não é enviada à API). */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .optional()
    .transform((v) => v || undefined);
