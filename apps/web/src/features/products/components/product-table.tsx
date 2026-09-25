import Link from "next/link";
import { Sku } from "@/components/ui/sku";
import { formatInt, formatMoney, UNIT_LABEL } from "@/lib/format";
import type { Product } from "@/lib/types";
import { StockBadge } from "./stock-badge";
import { StockLevel } from "./stock-level";

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="border-line bg-panel overflow-x-auto rounded-xs border">
      <table className="w-full min-w-190 text-sm">
        <thead className="text-muted border-line border-b text-left text-xs">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Produto</th>
            <th scope="col" className="px-4 py-3 font-medium">Categoria</th>
            <th scope="col" className="w-48 px-4 py-3 font-medium">Saldo</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Custo</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Venda</th>
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {products.map((p) => (
            <tr key={p.id} className="group hover:bg-sunken/50">
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1">
                  <Sku>{p.sku}</Sku>
                  <Link href={`/produtos/${p.id}`} className="font-medium group-hover:underline">
                    {p.name}
                  </Link>
                  {!p.active && <span className="text-muted text-xs">Arquivado</span>}
                </div>
              </td>
              <td className="text-ink-2 px-4 py-3">{p.category.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tabular font-mono font-medium">
                    {formatInt(p.quantity)} <span className="text-muted text-xs">{UNIT_LABEL[p.unit]}</span>
                  </span>
                  <StockBadge quantity={p.quantity} minQuantity={p.minQuantity} />
                </div>
                <StockLevel quantity={p.quantity} minQuantity={p.minQuantity} className="mt-2" />
                <p className="text-muted tabular mt-1 text-[11px]">mín. {formatInt(p.minQuantity)}</p>
              </td>
              <td className="text-ink-2 tabular px-4 py-3 text-right font-mono">{formatMoney(p.costPrice)}</td>
              <td className="tabular px-4 py-3 text-right font-mono">{formatMoney(p.salePrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
