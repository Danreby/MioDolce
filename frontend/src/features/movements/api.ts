import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { PagedResponse } from "@/lib/api/types";
import type { MovementListQuery, RegisterMovementRequest, StockMovement } from "./types";

export const movementsApi = {
  list: (query: MovementListQuery) => apiFetch<PagedResponse<StockMovement>>("/api/movements", { query }),
  register: (productId: string, body: RegisterMovementRequest) =>
    apiFetch<StockMovement>(`/api/products/${productId}/movements`, { method: "POST", body }),
};
