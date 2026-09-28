import { CheckCircleIcon, ProhibitIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { statusLabels } from "../labels";
import type { StockStatus } from "../types";

const styles: Record<StockStatus, string> = {
  Ok: "text-ink-2",
  Low: "bg-warn-soft text-warn",
  OutOfStock: "bg-danger-soft text-danger",
};

const icons = { Ok: CheckCircleIcon, Low: WarningIcon, OutOfStock: ProhibitIcon } as const;

/** Estado nunca é comunicado só por cor: sempre ícone + texto. */
export function StockStatusBadge({ status, archived = false }: { status: StockStatus; archived?: boolean }) {
  if (archived) {
    return <span className="text-sm text-muted">Arquivado</span>;
  }

  const Icon = icons[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[13px] font-medium ${styles[status]}`}>
      <Icon size={14} weight="bold" aria-hidden />
      {statusLabels[status]}
    </span>
  );
}
