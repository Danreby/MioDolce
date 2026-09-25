import { z } from "zod";
import { optionalText, requiredInt } from "@/lib/form-schemas";

export const movementSchema = z
  .object({
    productId: requiredInt("Escolha o produto"),
    type: z.enum(["IN", "OUT", "ADJUSTMENT"], { error: "Escolha o tipo" }),
    quantity: requiredInt("Informe a quantidade"),
    note: optionalText(255),
  })
  // Regra que depende de dois campos: validada no objeto inteiro.
  .refine((m) => m.type === "ADJUSTMENT" || m.quantity > 0, {
    path: ["quantity"],
    message: "Precisa ser maior que zero",
  });
