import "server-only";
import { api } from "@/lib/api-client";
import type { MovementType, Paginated, StockMovement } from "@/lib/types";

export interface MovementQuery {
  productId?: number;
  type?: MovementType;
  page?: string;
  pageSize?: number;
}

export function getMovements(query: MovementQuery = {}) {
  return api<Paginated<StockMovement>>("/stock-movements", { query: { pageSize: 20, ...query } });
}
