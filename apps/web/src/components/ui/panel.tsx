import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  title?: ReactNode;
  aside?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Superfície elevada do fundo concreto. Usada só para agrupar blocos reais de conteúdo. */
export function Panel({ title, aside, className, bodyClassName, children }: PanelProps) {
  return (
    // min-w-0: dentro de um grid, deixa o painel encolher e a tabela rolar por dentro.
    <section className={cn("border-line bg-panel min-w-0 rounded-xs border", className)}>
      {title && (
        <div className="border-line flex items-center justify-between gap-4 border-b px-5 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {aside}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
