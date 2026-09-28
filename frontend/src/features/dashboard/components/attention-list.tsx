import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import { StockMeter } from "@/features/products/components/stock-meter";
import { StockStatusBadge } from "@/features/products/components/stock-status";
import type { Product } from "@/features/products/types";
import { formatQuantity, unitShort } from "@/lib/format";

export function AttentionList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-2">
        <CheckCircleIcon size={18} className="text-accent" aria-hidden />
        Todos os produtos estão acima do mínimo.
      </p>
    );
  }

  return (
    <ul className="grid gap-5">
      {products.map((product) => (
        <li key={product.id} className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/produtos/${product.id}`} className="min-w-0 hover:underline">
              <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
              <span className="font-mono text-xs text-muted">{product.sku}</span>
            </Link>
            <StockStatusBadge status={product.status} />
          </div>
          <StockMeter quantity={product.quantityOnHand} minimum={product.minimumStock} status={product.status} />
          <p className="tabular text-xs text-muted">
            <span className="text-ink">{formatQuantity(product.quantityOnHand)}</span> de mínimo{" "}
            {formatQuantity(product.minimumStock)} {unitShort[product.unit]}
          </p>
        </li>
      ))}
    </ul>
  );
}
