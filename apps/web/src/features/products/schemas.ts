import { z } from "zod";
import { optionalInt, optionalText, requiredInt, requiredNumber } from "@/lib/form-schemas";

const money = (label: string) =>
  requiredNumber(`Informe o ${label}`).pipe(z.number().min(0, "Não pode ser negativo").max(99_999_999.99));

// Validação no front dá feedback imediato; a API valida de novo (nunca confie no cliente).
export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,32}$/, "3 a 32 caracteres: letras, números ou hífen"),
  name: z.string().trim().min(1, "Informe o nome").max(120, "Máximo de 120 caracteres"),
  description: optionalText(2000),
  unit: z.enum(["UN", "CX", "PCT", "KIT"], { error: "Escolha a unidade" }),
  categoryId: requiredInt("Escolha uma categoria"),
  costPrice: money("custo"),
  salePrice: money("preço de venda"),
  minQuantity: requiredInt("Informe o estoque mínimo"),
  initialQuantity: optionalInt,
});

export type ProductInput = z.infer<typeof productSchema>;
