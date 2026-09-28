import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto no formato do detalhe (saldo à esquerda, histórico à direita). */
export default function Loading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Carregando produto">
      <div className="grid gap-2 border-b border-line pb-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-80" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="grid content-start gap-4 lg:col-span-4">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-[480px] lg:col-span-8" />
      </div>
    </div>
  );
}
