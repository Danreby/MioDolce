import "server-only";
import { z } from "zod";

/**
 * Variáveis de ambiente validadas na inicialização.
 * "server-only" garante erro de build se este arquivo for importado em um Client Component:
 * a URL da API nunca vai para o navegador.
 */
const schema = z.object({
  API_URL: z.url().default("http://localhost:5080"),
});

export const env = schema.parse({
  API_URL: process.env.API_URL,
});
