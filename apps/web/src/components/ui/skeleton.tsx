import { cn } from "@/lib/cn";

/** Bloco cinza pulsante que ocupa o lugar do conteúdo enquanto ele carrega. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bg-sunken motion-safe:animate-pulse rounded-xs", className)} />;
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="border-line bg-panel rounded-xs border" role="status" aria-label="Carregando">
      <div className="border-line border-b px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-line flex items-center gap-6 border-b px-4 py-3.5 last:border-0">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
