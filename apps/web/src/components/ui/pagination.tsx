import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Paginated } from "@/lib/types";
import { buttonClass } from "./button";

interface PaginationProps {
  meta: Paginated<unknown>["meta"];
  /** Filtros atuais, preservados ao trocar de página. */
  searchParams: Record<string, string | undefined>;
  pathname: string;
}

// Paginação por links (não por estado): a URL é a fonte da verdade, então
// dá para compartilhar, dar F5 e usar o botão voltar.
export function Pagination({ meta, searchParams, pathname }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v) params.set(k, v);
    params.set("page", String(page));
    return `${pathname}?${params}`;
  };

  const prev = meta.page > 1 ? hrefFor(meta.page - 1) : null;
  const next = meta.page < meta.totalPages ? hrefFor(meta.page + 1) : null;

  return (
    <nav aria-label="Paginação" className="mt-4 flex items-center justify-between gap-4 text-sm">
      <p className="text-muted tabular">
        Página {meta.page} de {meta.totalPages} ({meta.total} itens)
      </p>
      <div className="flex gap-2">
        {prev ? (
          <Link href={prev} className={buttonClass({ size: "sm" })}>
            <CaretLeftIcon size={14} weight="bold" /> Anterior
          </Link>
        ) : null}
        {next ? (
          <Link href={next} className={buttonClass({ size: "sm" })}>
            Próxima <CaretRightIcon size={14} weight="bold" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
