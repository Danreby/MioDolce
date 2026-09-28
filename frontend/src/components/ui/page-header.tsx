import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  kicker,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  kicker?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div className="grid gap-1.5">
        {kicker}
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
        {description ? <p className="max-w-[65ch] text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
