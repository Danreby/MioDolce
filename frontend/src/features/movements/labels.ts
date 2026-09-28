import type { MovementType } from "./types";

export const movementLabels: Record<MovementType, string> = {
  Entry: "Entrada",
  Exit: "Saída",
  Adjustment: "Ajuste",
};

export const movementHints: Record<MovementType, string> = {
  Entry: "Compra, produção ou devolução. Soma ao saldo.",
  Exit: "Venda, consumo ou perda. Não pode passar do saldo.",
  Adjustment: "Informe o saldo contado na prateleira. O sistema calcula a diferença.",
};
