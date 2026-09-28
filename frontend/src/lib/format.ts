import type { UnitOfMeasure } from "@/features/products/types";

const LOCALE = "pt-BR";
const TIME_ZONE = "America/Sao_Paulo";

const currency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "BRL" });
const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});
const quantity = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 3 });
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const longDate = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", timeZone: TIME_ZONE });
const shortDay = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export const unitShort: Record<UnitOfMeasure, string> = {
  Unit: "un",
  Kilogram: "kg",
  Gram: "g",
  Liter: "L",
  Milliliter: "mL",
  Box: "cx",
  Package: "pct",
};

export const formatMoney = (value: number) => currency.format(value);
export const formatMoneyCompact = (value: number) => compactCurrency.format(value);
export const formatQuantity = (value: number) => quantity.format(value);
export const formatQuantityWithUnit = (value: number, unit: UnitOfMeasure) =>
  `${quantity.format(value)} ${unitShort[unit]}`;

/** Aceita datas da API com ou sem sufixo de fuso (o banco guarda UTC). */
export function parseUtc(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
}

export const formatDateTime = (value: string) => dateTime.format(parseUtc(value));
export const formatLongDate = (value: Date) => longDate.format(value);
/** Para DateOnly ("2026-09-28"), que não tem fuso. */
export const formatDay = (isoDate: string) => shortDay.format(new Date(`${isoDate}T00:00:00Z`));
export const formatWeekday = (isoDate: string) => weekday.format(new Date(`${isoDate}T00:00:00Z`));
