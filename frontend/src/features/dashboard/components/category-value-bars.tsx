import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { CategoryValue } from "../types";

/**
 * Uma série só (magnitude), então uma cor só e nenhuma legenda: o título já diz o que é.
 * Valor na ponta da barra; o hover mostra quantos produtos compõem o valor.
 */
export function CategoryValueBars({ items }: { items: CategoryValue[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul className="grid gap-3.5">
      {items.map((item) => (
        <li key={item.categoryId} className="group relative grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <Link href={`/produtos?categoryId=${item.categoryId}`} className="truncate text-ink hover:underline">
              {item.name}
            </Link>
            <span className="tabular shrink-0 text-ink-2">{formatMoney(item.value)}</span>
          </div>
          <div className="h-3">
            <div
              className="h-full rounded-r-[4px] bg-accent/80 transition-colors group-hover:bg-accent"
              style={{ width: `max(${(item.value / max) * 100}%, 2px)` }}
            />
          </div>
          <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink-2 shadow-md shadow-ink/10 group-hover:block">
            {item.productCount} {item.productCount === 1 ? "produto ativo" : "produtos ativos"}
          </span>
        </li>
      ))}
    </ul>
  );
}
