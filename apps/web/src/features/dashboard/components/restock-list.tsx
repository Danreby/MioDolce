import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Sku } from "@/components/ui/sku";
import { StockBadge } from "@/features/products/components/stock-badge";
import { StockLevel } from "@/features/products/components/stock-level";
import { formatInt, UNIT_LABEL } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";

export function RestockList({ items }: { items: DashboardSummary["lowStockItems"] }) {
  if (items.length === 0) {
    return (
      <p className="text-ink-2 flex items-center gap-2 text-sm">
        <CheckCircleIcon size={18} />
        Todos os produtos estão acima do mínimo.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <Sku>{item.sku}</Sku>
            <StockBadge quantity={item.quantity} minQuantity={item.minQuantity} />
          </div>
          <Link href={`/produtos/${item.id}`} className="line-clamp-1 text-sm font-medium hover:underline">
            {item.name}
          </Link>
          <StockLevel quantity={item.quantity} minQuantity={item.minQuantity} className="mt-2" />
          <p className="text-muted tabular mt-1 font-mono text-[11px]">
            {formatInt(item.quantity)} de mín. {formatInt(item.minQuantity)} {UNIT_LABEL[item.unit]}
          </p>
        </li>
      ))}
    </ul>
  );
}
