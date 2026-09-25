"use client";

import { usePathname } from "next/navigation";
import { NavList } from "./nav-list";

// Único pedaço da sidebar que precisa rodar no cliente: saber a URL atual.
export function ActiveNav() {
  return <NavList pathname={usePathname()} />;
}
