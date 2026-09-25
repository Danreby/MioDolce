import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: Icon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon: IconComponent, title, children, action }: EmptyStateProps) {
  return (
    <div className="border-line-strong flex flex-col items-start gap-3 rounded-xs border border-dashed px-6 py-10 md:px-10">
      <IconComponent size={28} className="text-muted" />
      <div>
        <p className="font-semibold">{title}</p>
        {children && <p className="text-ink-2 mt-1 max-w-[55ch] text-sm">{children}</p>}
      </div>
      {action}
    </div>
  );
}
