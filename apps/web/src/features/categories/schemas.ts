import { z } from "zod";
import { optionalText } from "@/lib/form-schemas";

// Validação no front dá feedback imediato; a API valida de novo (nunca confie no cliente).
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80, "Máximo de 80 caracteres"),
  description: optionalText(255),
});

export type CategoryInput = z.infer<typeof categorySchema>;
