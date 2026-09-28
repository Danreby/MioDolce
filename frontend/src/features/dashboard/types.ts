import type { StockMovement } from "@/features/movements/types";
import type { Product } from "@/features/products/types";

export type CategoryValue = {
  categoryId: string;
  name: string;
  productCount: number;
  value: number;
};

export type DailyFlow = {
  date: string; // DateOnly: "2026-09-28"
  entriesValue: number;
  exitsValue: number;
};

export type Dashboard = {
  activeProducts: number;
  categories: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  needsAttention: Product[];
  recentMovements: StockMovement[];
  valueByCategory: CategoryValue[];
  dailyFlow: DailyFlow[];
};
