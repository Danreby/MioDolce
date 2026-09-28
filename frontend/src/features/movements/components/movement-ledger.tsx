import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, ScalesIcon } from "@phosphor-icons/react/ssr";
import { formatDateTime, formatQuantity, unitShort } from "@/lib/format";
import { movementLabels } from "../labels";
import type { MovementType, StockMovement } from "../types";

const typeIcon: Record<MovementType, React.ReactNode> = {
  Entry: <ArrowUpIcon size={14} weight="bold" className="text-flow-in" aria-hidden />,
  Exit: <ArrowDownIcon size={14} weight="bold" className="text-flow-out" aria-hidden />,
  Adjustment: <ScalesIcon size={14} weight="bold" className="text-ink-2" aria-hidden />,
};

/**
 * Livro-razão: cada linha diz o que mudou (delta com sinal) e como ficou (saldo após).
 * `showProduct` some quando a lista já é de um único produto.
 */
export function MovementLedger({
  movements,
  showProduct = true,
  compact = false,
}: {
  movements: StockMovement[];
  showProduct?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="py-2 pr-4 font-normal">Quando</th>
            {showProduct ? <th className="py-2 pr-4 font-normal">Produto</th> : null}
            <th className="py-2 pr-4 font-normal">Tipo</th>
            <th className="py-2 pr-4 text-right font-normal">Variação</th>
            <th className="py-2 pr-4 text-right font-normal">Saldo após</th>
            {compact ? null : <th className="py-2 font-normal">Observação</th>}
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="border-b border-line/70 last:border-0">
              <td className="tabular whitespace-nowrap py-2.5 pr-4 text-ink-2">{formatDateTime(movement.occurredAtUtc)}</td>
              {showProduct ? (
                <td className="max-w-64 py-2.5 pr-4">
                  <Link href={`/produtos/${movement.productId}`} className="block truncate text-ink hover:underline">
                    {movement.productName}
                  </Link>
                </td>
              ) : null}
              <td className="whitespace-nowrap py-2.5 pr-4">
                <span className="inline-flex items-center gap-1.5 text-ink-2">
                  {typeIcon[movement.type]}
                  {movementLabels[movement.type]}
                </span>
              </td>
              <td className="tabular whitespace-nowrap py-2.5 pr-4 text-right font-mono text-[13px] text-ink">
                {movement.delta > 0 ? "+" : "-"}
                {formatQuantity(Math.abs(movement.delta))}
                <span className="ml-1 text-muted">{unitShort[movement.unit]}</span>
              </td>
              <td className="tabular whitespace-nowrap py-2.5 pr-4 text-right font-mono text-[13px] text-ink-2">
                {formatQuantity(movement.balanceAfter)}
              </td>
              {compact ? null : <td className="max-w-72 truncate py-2.5 text-ink-2">{movement.note ?? ""}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
