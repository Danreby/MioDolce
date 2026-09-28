import type { ReactNode } from "react";

/** Bloco com título. Usado quando o conteúdo precisa de um limite visual claro (gráficos, listas). */
export function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`grid content-start gap-5 rounded-lg border border-line bg-surface p-5 md:p-6 ${className}`}>
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
