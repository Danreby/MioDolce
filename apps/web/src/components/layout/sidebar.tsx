import { Suspense } from "react";
import { ActiveNav } from "./active-nav";
import { NavList } from "./nav-list";

/**
 * Server Component. Com Cache Components, ler a URL (usePathname) em rotas
 * dinâmicas precisa ficar dentro de <Suspense>: o fallback é a mesma lista
 * sem o item ativo, então a navegação aparece já no HTML inicial.
 */
export function Sidebar() {
  return (
    <aside className="border-line bg-panel border-b md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0">
      <div className="flex items-center gap-3 px-4 py-4 md:px-6 md:py-7">
        <span
          aria-hidden
          className="bg-signal display grid size-8 place-items-center rounded-xs text-lg font-extrabold text-[#16191c]"
        >
          A
        </span>
        <span className="display text-lg font-bold tracking-tight">Almoxarife</span>
      </div>

      <nav aria-label="Principal" className="overflow-x-auto">
        <Suspense fallback={<NavList pathname={null} />}>
          <ActiveNav />
        </Suspense>
      </nav>
    </aside>
  );
}
