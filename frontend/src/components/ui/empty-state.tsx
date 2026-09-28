import type { ReactNode } from "react";

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-3 rounded-lg border border-dashed border-line-strong px-6 py-10">
      <span className="text-muted" aria-hidden>
        {icon}
      </span>
      <div className="grid gap-1">
        <p className="font-medium text-ink">{title}</p>
        {children ? <div className="max-w-[60ch] text-sm text-muted">{children}</div> : null}
      </div>
    </div>
  );
}
