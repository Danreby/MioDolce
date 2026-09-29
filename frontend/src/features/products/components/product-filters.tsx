import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import type { Category } from "@/features/categories/types";
import { sortLabels } from "../labels";
import { productSorts, type ProductSort, type StockStatus } from "../types";

/**
 * Formulário GET comum: ao enviar, o navegador monta a query string (?search=...&sort=...)
 * e a página (Server Component) relê os filtros da URL. Funciona até sem JavaScript.
 */
export function ProductFilters({
  categories,
  current,
}: {
  categories: Category[];
  current: { search?: string; categoryId?: string; sort?: ProductSort; status?: StockStatus; includeInactive: boolean };
}) {
  return (
    <form role="search" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_220px_auto_auto] md:items-center">
      {current.status ? <input type="hidden" name="status" value={current.status} /> : null}

      <label className="relative">
        <span className="sr-only">Buscar por nome, SKU ou código de barras</span>
        <MagnifyingGlassIcon size={16} className="pointer-events-none absolute left-3 top-2.5 text-muted" aria-hidden />
        <Input name="search" type="search" defaultValue={current.search} placeholder="Buscar por nome, SKU ou código de barras" className="pl-9" />
      </label>

      <label>
        <span className="sr-only">Categoria</span>
        <Select name="categoryId" defaultValue={current.categoryId ?? ""}>
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </label>

      <label>
        <span className="sr-only">Ordenar por</span>
        <Select name="sort" defaultValue={current.sort ?? "Name"}>
          {productSorts.map((sort) => (
            <option key={sort} value={sort}>
              Ordenar: {sortLabels[sort]}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="includeInactive" value="true" defaultChecked={current.includeInactive} className="size-4 accent-accent" />
        Incluir arquivados
      </label>

      <Button type="submit">Aplicar</Button>
    </form>
  );
}
