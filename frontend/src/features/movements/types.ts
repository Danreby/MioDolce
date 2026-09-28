import type { UnitOfMeasure } from "@/features/products/types";

export const movementTypes = ["Entry", "Exit", "Adjustment"] as const;
export type MovementType = (typeof movementTypes)[number];

export type StockMovement = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  unit: UnitOfMeasure;
  type: MovementType;
  delta: number;
  balanceAfter: number;
  note: string | null;
  occurredAtUtc: string;
};

export type MovementListQuery = {
  productId?: string;
  type?: MovementType;
  fromUtc?: string;
  toUtc?: string;
  page?: number;
  pageSize?: number;
};

export type RegisterMovementRequest = {
  type: MovementType;
  quantity: number;
  note: string | null;
};
