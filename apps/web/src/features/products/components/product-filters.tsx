"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

const STATUS_TABS = [
  { value: "", label: "Todos" },
  { value: "low", label: "Baixo" },
  { value: "out", label: "Zerado" },
  { value: "archived", label: "Arquivados" },
] as const;

/**
 * Os filtros não guardam estado próprio: eles escrevem na URL
 * (?search=...&status=low) e a página, que é Server Component, relê a URL e
 * busca os dados. useTransition deixa a UI responsiva enquanto isso acontece.
 */
export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const firstRender = useRef(true);

  const activeTab = searchParams.get("archived") === "true" ? "archived" : (searchParams.get("status") ?? "");

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // novo filtro volta para a página 1
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  }

  // Debounce: só atualiza a URL 300ms depois que a pessoa para de digitar.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => update({ search: search.trim() || null }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center" aria-busy={pending}>
      <div className="relative lg:w-80">
        <MagnifyingGlassIcon size={16} className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou SKU"
          aria-label="Buscar produtos"
          className="pl-9"
        />
      </div>

      <Select
        aria-label="Filtrar por categoria"
        value={searchParams.get("categoryId") ?? ""}
        onChange={(e) => update({ categoryId: e.target.value || null })}
        className="lg:w-56"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <div role="group" aria-label="Situação do estoque" className="border-line-strong bg-panel flex rounded-xs border p-0.5 lg:ml-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={activeTab === tab.value}
            onClick={() =>
              update(
                tab.value === "archived"
                  ? { archived: "true", status: null }
                  : { status: tab.value || null, archived: null },
              )
            }
            className={cn(
              "flex-1 rounded-xs px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
              activeTab === tab.value ? "bg-ink text-panel font-medium" : "text-ink-2 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
