import "server-only";
import { env } from "@/lib/env";
import type { ProblemDetails } from "./types";

/**
 * Erro vindo da API. Carrega o ProblemDetails (RFC 9457) que o ASP.NET Core devolve,
 * incluindo `errors` (validação por campo) e `code` (código estável do erro de negócio).
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetails,
  ) {
    super(problem.detail ?? problem.title ?? `Erro ${status} na API`);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

/**
 * Único ponto de acesso HTTP à API .NET. Roda só no servidor (Server Components e
 * Server Actions), então o navegador nunca conversa direto com o backend.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path, env.API_URL);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    // Dados de estoque mudam o tempo todo: sempre buscar o valor atual.
    cache: "no-store",
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetails;
    throw new ApiError(response.status, { status: response.status, ...problem });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
