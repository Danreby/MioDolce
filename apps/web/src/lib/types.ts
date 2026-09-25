/**
 * Contratos da API (espelham as respostas do NestJS).
 * Valores Decimal do banco chegam como string ("12.5") para não perder precisão.
 */

export type Unit = "UN" | "CX" | "PCT" | "KIT";
export type MovementType = "IN" | "OUT" | "ADJUSTMENT";
export type StockStatus = "ok" | "low" | "out";

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  _count?: { products: number };
}

export interface ProductSummary {
  id: number;
  sku: string;
  name: string;
  unit: Unit;
}

export interface Product extends ProductSummary {
  description: string | null;
  costPrice: string;
  salePrice: string;
  quantity: number;
  minQuantity: number;
  active: boolean;
  categoryId: number;
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  type: MovementType;
  delta: number;
  balanceAfter: number;
  note: string | null;
  productId: number;
  createdAt: string;
  product: ProductSummary;
}

export interface DashboardSummary {
  totals: {
    products: number;
    units: number;
    inventoryValue: string;
    outOfStock: number;
    lowStock: number;
  };
  flow: { day: string; inbound: number; outbound: number }[];
  lowStockItems: (ProductSummary & { quantity: number; minQuantity: number })[];
  recentMovements: StockMovement[];
}
