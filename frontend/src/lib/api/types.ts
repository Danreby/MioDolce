/**
 * Tipos que espelham os contratos (records) da API .NET.
 * Quando mudar um DTO no backend, mude aqui também. Um próximo passo de estudo
 * é gerar estes tipos automaticamente a partir de /openapi/v1.json (openapi-typescript).
 */

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
