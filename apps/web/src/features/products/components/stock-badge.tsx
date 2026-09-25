import { WarningIcon, WarningOctagonIcon } from "@phosphor-icons/react/dist/ssr";
import { STATUS_LABEL, stockStatus } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Status do saldo. Só "baixo" e "zerado" ganham cor, e sempre com ícone +
 * texto (nunca só cor), para funcionar também para daltônicos.
 */
export function StockBadge({ quantity, minQuantity, className }: { quantity: number; minQuantity: number; className?: string }) {
  const status = stockStatus(quantity, minQuantity);
  if (status === "ok") return null;

  const out = status === "out";
  const Icon = out ? WarningOctagonIcon : WarningIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[11px] font-semibold uppercase",
        out ? "bg-danger-soft text-danger" : "bg-signal-soft text-ink",
        className,
      )}
    >
      <Icon size={12} weight="bold" />
      {STATUS_LABEL[status]}
    </span>
  );
}
