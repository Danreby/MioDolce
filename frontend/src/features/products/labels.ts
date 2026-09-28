import type { ProductSort, StockStatus, UnitOfMeasure } from "./types";

// A API fala inglês (valores de enum); a interface fala português. A tradução mora aqui.

export const unitLabels: Record<UnitOfMeasure, string> = {
  Unit: "Unidade",
  Kilogram: "Quilograma",
  Gram: "Grama",
  Liter: "Litro",
  Milliliter: "Mililitro",
  Box: "Caixa",
  Package: "Pacote",
};

export const statusLabels: Record<StockStatus, string> = {
  Ok: "Em dia",
  Low: "Abaixo do mínimo",
  OutOfStock: "Zerado",
};

export const sortLabels: Record<ProductSort, string> = {
  Name: "Nome",
  Sku: "SKU",
  LowestStock: "Mais perto do mínimo",
  HighestValue: "Maior valor em estoque",
  Newest: "Cadastro mais recente",
};
