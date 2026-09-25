import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xs border font-medium whitespace-nowrap transition-[transform,box-shadow,background-color] select-none disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Botão principal parece uma etiqueta: amarelo, borda de tinta e sombra
  // dura que "afunda" ao clicar (feedback tátil).
  primary:
    "bg-signal text-[#16191c] border-[#16191c] shadow-[2px_2px_0_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  secondary: "bg-panel text-ink border-line-strong hover:bg-sunken active:translate-y-px",
  ghost: "bg-transparent text-ink-2 border-transparent hover:bg-sunken hover:text-ink",
  danger: "bg-panel text-danger border-line-strong hover:bg-danger-soft active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
}

export function buttonClass({ variant = "secondary", size = "md" }: StyleProps = {}, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}
