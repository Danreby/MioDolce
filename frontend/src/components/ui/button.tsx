import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3.5 text-sm font-medium " +
  "transition-[background-color,border-color,transform] duration-150 active:translate-y-px " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink-2",
  ghost: "text-ink-2 hover:bg-sunken hover:text-ink",
  danger: "border border-danger/40 text-danger hover:bg-danger-soft",
};

/** Função de estilo exportada para reaproveitar o visual em <Link>, <button> ou <summary>. */
export function buttonStyles(variant: Variant = "secondary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

export function Button({ variant, className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}

export function ButtonLink({ variant, className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonStyles(variant, className)} {...props} />;
}
