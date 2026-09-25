import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, ScalesIcon } from "@phosphor-icons/react/dist/ssr";
import { Sku } from "@/components/ui/sku";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDelta, formatInt, MOVEMENT_LABEL, UNIT_LABEL } from "@/lib/format";
import type { MovementType, StockMovement } from "@/lib/types";

const ICON: Record<MovementType, typeof ArrowUpIcon> = {
  IN: ArrowDownIcon,
  OUT: ArrowUpIcon,
  ADJUSTMENT: ScalesIcon,
};

interface MovementLedgerProps {
  movements: StockMovement[];
  /** Esconde a coluna de produto (útil dentro da página de um produto). */
  hideProduct?: boolean;
  compact?: boolean;
}

/** Histórico em formato de extrato: data, tipo, variação e saldo resultante. */
export function MovementLedger({ movements, hideProduct, compact }: MovementLedgerProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", !compact && "min-w-150")}>
        <thead className="text-muted border-line border-b text-left text-xs">
          <tr>
            <th scope="col" className="py-2.5 pr-4 font-medium">Quando</th>
            <th scope="col" className="py-2.5 pr-4 font-medium">Tipo</th>
            {!hideProduct && <th scope="col" className="py-2.5 pr-4 font-medium">Produto</th>}
            <th scope="col" className="py-2.5 pr-4 text-right font-medium">Variação</th>
            <th scope="col" className="py-2.5 text-right font-medium">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {movements.map((m) => {
            const Icon = ICON[m.type];
            return (
              <tr key={m.id}>
                <td className="text-ink-2 tabular py-2.5 pr-4 font-mono text-xs whitespace-nowrap">{formatDateTime(m.createdAt)}</td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={14} weight="bold" className="text-muted" />
                    {MOVEMENT_LABEL[m.type]}
                  </span>
                  {m.note && !compact && <p className="text-muted mt-0.5 max-w-64 truncate text-xs">{m.note}</p>}
                </td>
                {!hideProduct && (
                  <td className="py-2.5 pr-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <Sku>{m.product.sku}</Sku>
                      <Link href={`/produtos/${m.product.id}`} className="truncate hover:underline">
                        {m.product.name}
                      </Link>
                    </div>
                  </td>
                )}
                <td className="tabular py-2.5 pr-4 text-right font-mono font-semibold whitespace-nowrap">
                  {formatDelta(m.delta)}
                </td>
                <td className="text-ink-2 tabular py-2.5 text-right font-mono whitespace-nowrap">
                  {formatInt(m.balanceAfter)} <span className="text-muted text-xs">{UNIT_LABEL[m.product.unit]}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
