import type { StockStatus } from "../types";

const fill: Record<StockStatus, string> = {
  Ok: "bg-accent",
  Low: "bg-warn",
  OutOfStock: "bg-danger",
};

/**
 * Medidor saldo x mínimo. A escala vai até 2x o mínimo; o traço vertical marca o mínimo.
 * É decorativo (aria-hidden): o número ao lado já comunica o valor.
 */
export function StockMeter({ quantity, minimum, status }: { quantity: number; minimum: number; status: StockStatus }) {
  const scale = Math.max(minimum * 2, quantity, 1);
  const width = Math.min(100, (quantity / scale) * 100);
  const marker = Math.min(100, (minimum / scale) * 100);

  return (
    <div aria-hidden className="relative h-1.5 w-full rounded-full bg-sunken">
      <div className={`h-full rounded-full ${fill[status]}`} style={{ width: `${width}%` }} />
      {minimum > 0 ? (
        <div className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-ink-2" style={{ left: `calc(${marker}% - 1px)` }} />
      ) : null}
    </div>
  );
}
