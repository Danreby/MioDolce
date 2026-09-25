import { stockStatus } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Régua do saldo em relação ao mínimo. A escala vai até 2x o mínimo, e a
 * marca vertical mostra onde fica o mínimo.
 */
export function StockLevel({ quantity, minQuantity, className }: { quantity: number; minQuantity: number; className?: string }) {
  const max = Math.max(minQuantity * 2, quantity, 1);
  const fill = Math.min(100, (quantity / max) * 100);
  const minAt = (minQuantity / max) * 100;
  const status = stockStatus(quantity, minQuantity);

  return (
    <div
      className={cn("bg-sunken relative h-1.5 w-full rounded-xs", className)}
      role="meter"
      aria-valuenow={quantity}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`Saldo ${quantity}, mínimo ${minQuantity}`}
    >
      <div
        className={cn(
          "h-full rounded-xs",
          status === "ok" && "bg-ink-2",
          status === "low" && "bg-signal",
          status === "out" && "bg-danger",
        )}
        style={{ width: `${fill}%` }}
      />
      {minQuantity > 0 && (
        <span aria-hidden className="bg-ink absolute -top-1 -bottom-1 w-px" style={{ left: `${minAt}%` }} />
      )}
    </div>
  );
}
