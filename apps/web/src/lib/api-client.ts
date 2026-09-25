import "server-only";

/**
 * Cliente HTTP da API. `server-only` garante que este arquivo nunca vá para o
 * bundle do navegador: o front só fala com a API a partir do servidor
 * (Server Components e Server Actions), então a URL da API fica privada.
 */

const API_URL = process.env.API_URL ?? "http://localhost:3333/api/v1";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Query;
  body?: unknown;
}

export async function api<T>(path: string, { query, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(503, "A API não respondeu. Ela está rodando? (npm run dev:api)");
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    // O Nest devolve { message: string | string[] }.
    const message = payload?.message;
    throw new ApiError(response.status, Array.isArray(message) ? message.join(". ") : message ?? response.statusText);
  }
  return payload as T;
}
