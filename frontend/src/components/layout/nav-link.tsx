"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Client Component mínimo: usePathname só existe no navegador. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "flex shrink-0 items-center border-b-2 text-sm transition-colors " +
        (active ? "border-accent font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink")
      }
    >
      {children}
    </Link>
  );
}
