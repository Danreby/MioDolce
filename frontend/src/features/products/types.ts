export const unitsOfMeasure = ["Unit", "Kilogram", "Gram", "Liter", "Milliliter", "Box", "Package"] as const;
export type UnitOfMeasure = (typeof unitsOfMeasure)[number];

export const stockStatuses = ["Ok", "Low", "OutOfStock"] as const;
export type StockStatus = (typeof stockStatuses)[number];

export const productSorts = ["Name", "Sku", "LowestStock", "HighestValue", "Newest"] as const;
export type ProductSort = (typeof productSorts)[number];

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  unit: UnitOfMeasure;
  unitCost: number;
  quantityOnHand: number;
  minimumStock: number;
  stockValue: number;
  status: StockStatus;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type ProductListQuery = {
  search?: string;
  categoryId?: string;
  status?: StockStatus;
  includeInactive?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ProductDetails = {
  name: string;
  description: string | null;
  categoryId: string;
  unit: UnitOfMeasure;
  unitCost: number;
  minimumStock: number;
};

export type CreateProductRequest = ProductDetails & { sku: string; initialQuantity: number };
export type UpdateProductRequest = ProductDetails & { isActive: boolean };
