import Link from "next/link";
import { formatMoney, formatQuantity, unitShort } from "@/lib/format";
import type { Product } from "../types";
import { StockStatusBadge } from "./stock-status";

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="py-2.5 pr-4 font-normal">Produto</th>
            <th className="py-2.5 pr-4 text-right font-normal">Saldo</th>
            <th className="py-2.5 pr-4 text-right font-normal">Mínimo</th>
            <th className="py-2.5 pr-4 text-right font-normal">Custo unit.</th>
            <th className="py-2.5 pr-4 text-right font-normal">Valor</th>
            <th className="py-2.5 font-normal">Situação</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="group border-b border-line/70 last:border-0 hover:bg-surface">
              <td className="py-3 pr-4">
                <Link href={`/produtos/${product.id}`} className="grid gap-0.5">
                  <span className={`font-medium group-hover:underline ${product.isActive ? "text-ink" : "text-muted"}`}>
                    {product.name}
                  </span>
                  <span className="text-xs text-muted">
                    <span className="font-mono">{product.sku}</span>
                    <span className="mx-1.5" aria-hidden>
                      /
                    </span>
                    {product.categoryName}
                  </span>
                </Link>
              </td>
              <td className="tabular whitespace-nowrap py-3 pr-4 text-right font-mono text-[13px] text-ink">
                {formatQuantity(product.quantityOnHand)} <span className="text-muted">{unitShort[product.unit]}</span>
              </td>
              <td className="tabular py-3 pr-4 text-right font-mono text-[13px] text-ink-2">
                {formatQuantity(product.minimumStock)}
              </td>
              <td className="tabular whitespace-nowrap py-3 pr-4 text-right text-ink-2">{formatMoney(product.unitCost)}</td>
              <td className="tabular whitespace-nowrap py-3 pr-4 text-right text-ink">{formatMoney(product.stockValue)}</td>
              <td className="py-3">
                <StockStatusBadge status={product.status} archived={!product.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
