import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}

export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-muted hover:text-ink mb-3 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeftIcon size={14} weight="bold" />
            {back.label}
          </Link>
        )}
        <h1 className="display text-3xl leading-tight font-bold md:text-4xl">{title}</h1>
        {description && <p className="text-ink-2 mt-2 max-w-[65ch] text-sm">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
