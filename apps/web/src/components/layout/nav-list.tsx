import Link from "next/link";
import { ArrowsDownUpIcon, GaugeIcon, PackageIcon, TagIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Painel", icon: GaugeIcon },
  { href: "/produtos", label: "Produtos", icon: PackageIcon },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowsDownUpIcon },
  { href: "/categorias", label: "Categorias", icon: TagIcon },
] as const;

/** Lista de navegação sem hooks: serve tanto para o servidor quanto para o cliente. */
export function NavList({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) => pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <ul className="flex gap-1 px-2 pb-2 md:flex-col md:px-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xs px-3 py-2 text-sm whitespace-nowrap transition-colors",
                active ? "bg-sunken text-ink font-semibold" : "text-ink-2 hover:bg-sunken/60 hover:text-ink",
              )}
            >
              {active && <span aria-hidden className="bg-signal absolute inset-y-1 left-0 w-[3px]" />}
              <Icon size={18} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
