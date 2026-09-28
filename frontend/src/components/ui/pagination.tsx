import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";
import type { PagedResponse } from "@/lib/api/types";
import { hrefWith, type SearchParams } from "@/lib/search-params";

const pageLink =
  "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm text-ink-2 hover:bg-sunken hover:text-ink";

/** Paginação por links (funciona sem JavaScript e mantém os filtros na URL). */
export function Pagination({
  pathname,
  params,
  data,
}: {
  pathname: string;
  params: SearchParams;
  data: Pick<PagedResponse<unknown>, "page" | "totalPages" | "totalCount" | "hasNextPage" | "hasPreviousPage">;
}) {
  if (data.totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-4 pt-4 text-sm">
      <p className="text-muted">
        Página <span className="tabular text-ink">{data.page}</span> de{" "}
        <span className="tabular text-ink">{data.totalPages}</span>
      </p>
      <div className="flex gap-1">
        {data.hasPreviousPage ? (
          <Link className={pageLink} href={hrefWith(pathname, params, { page: String(data.page - 1) })}>
            <CaretLeftIcon size={14} aria-hidden /> Anterior
          </Link>
        ) : null}
        {data.hasNextPage ? (
          <Link className={pageLink} href={hrefWith(pathname, params, { page: String(data.page + 1) })}>
            Próxima <CaretRightIcon size={14} aria-hidden />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
