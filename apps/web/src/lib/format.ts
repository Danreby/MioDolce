import type { MovementType, StockStatus, Unit } from "./types";

// Intl é nativo: formatação pt-BR sem bibliotecas extras.
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");
const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});
const shortDay = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

export const formatMoney = (value: string | number) => brl.format(Number(value));
export const formatInt = (value: number) => integer.format(value);
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
/** "2026-09-14" -> "14/09" */
export const formatDay = (isoDay: string) => shortDay.format(new Date(`${isoDay}T00:00:00Z`));
export const formatDelta = (delta: number) => (delta > 0 ? `+${integer.format(delta)}` : `−${integer.format(-delta)}`);

export const UNIT_LABEL: Record<Unit, string> = { UN: "un", CX: "cx", PCT: "pct", KIT: "kit" };
export const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: "UN", label: "Unidade (un)" },
  { value: "CX", label: "Caixa (cx)" },
  { value: "PCT", label: "Pacote (pct)" },
  { value: "KIT", label: "Kit" },
];

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste",
};

export function stockStatus(quantity: number, minQuantity: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= minQuantity) return "low";
  return "ok";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  ok: "Normal",
  low: "Baixo",
  out: "Zerado",
};
