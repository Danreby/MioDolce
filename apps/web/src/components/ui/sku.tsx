import { cn } from "@/lib/cn";

/** SKU com cara de etiqueta de prateleira. */
export function Sku({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "border-line-strong text-ink-2 inline-block rounded-xs border px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-tight whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}
