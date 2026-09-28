import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { ButtonLink } from "@/components/ui/button";
import { NavLink } from "./nav-link";

const links = [
  { href: "/", label: "Painel" },
  { href: "/produtos", label: "Produtos" },
  { href: "/movimentacoes", label: "Movimentações" },
  { href: "/categorias", label: "Categorias" },
];

/** Server Component: só o <NavLink> (que precisa saber a rota atual) roda no navegador. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-350 items-center gap-6 px-4 md:px-8">
        <Link href="/" className="text-[17px] font-semibold tracking-tight text-ink">
          Mio<span className="text-accent">Dolce</span>
        </Link>

        <nav aria-label="Principal" className="-mb-px flex h-full min-w-0 flex-1 gap-5 overflow-x-auto">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <ButtonLink href="/produtos/novo" variant="primary" className="hidden sm:inline-flex">
          <PlusIcon size={16} weight="bold" aria-hidden />
          Novo produto
        </ButtonLink>
      </div>
    </header>
  );
}
