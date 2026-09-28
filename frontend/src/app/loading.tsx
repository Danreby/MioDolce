import { Skeleton } from "@/components/ui/skeleton";

/**
 * loading.tsx vira automaticamente um <Suspense> em volta da página:
 * aparece na hora enquanto o Server Component espera a API.
 */
export default function Loading() {
  return (
    <div className="grid gap-10" aria-busy="true" aria-label="Carregando">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="grid gap-3 lg:col-span-7">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-14 w-80" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-32 lg:col-span-5" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-80 lg:col-span-8" />
        <Skeleton className="h-80 lg:col-span-4" />
      </div>
    </div>
  );
}
