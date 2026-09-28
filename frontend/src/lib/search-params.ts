/** Leitura segura de searchParams (que podem vir como string, string[] ou ausentes). */
export type SearchParams = Record<string, string | string[] | undefined>;

export function readString(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  const single = Array.isArray(value) ? value[0] : value;
  return single?.trim() ? single.trim() : undefined;
}

export function readPage(params: SearchParams): number {
  const page = Number(readString(params, "page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function readEnum<T extends string>(params: SearchParams, key: string, allowed: readonly T[]): T | undefined {
  const value = readString(params, key);
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** Monta um href mantendo os filtros atuais e trocando só o que foi pedido. */
export function hrefWith(pathname: string, params: SearchParams, changes: Record<string, string | undefined>): string {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single) next.set(key, single);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) next.delete(key);
    else next.set(key, value);
  }
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}
