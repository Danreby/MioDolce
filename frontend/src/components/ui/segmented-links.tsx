import Link from "next/link";

export type SegmentOption = { label: string; href: string; active: boolean };

/** Filtro de opção única feito de links (estado vive na URL, compartilhável e sem JS). */
export function SegmentedLinks({ label, options }: { label: string; options: SegmentOption[] }) {
  return (
    <nav aria-label={label} className="inline-flex flex-wrap gap-1 rounded-md bg-sunken p-1">
      {options.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          aria-current={option.active ? "page" : undefined}
          className={
            "rounded-[5px] px-2.5 py-1 text-sm transition-colors " +
            (option.active ? "bg-surface font-medium text-ink shadow-sm shadow-ink/5" : "text-ink-2 hover:text-ink")
          }
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
