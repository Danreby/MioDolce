import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xs border border-line-strong bg-panel px-3 text-sm text-ink placeholder:text-muted transition-colors hover:border-ink-2 focus-visible:border-ink aria-invalid:border-danger aria-invalid:bg-danger-soft/40";

interface FieldProps {
  label: string;
  error?: string[];
  hint?: string;
  className?: string;
  /** Recebe os atributos de acessibilidade para aplicar no controle. */
  children: (control: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}

/**
 * Label em cima, controle, dica e erro embaixo. Liga tudo via id /
 * aria-describedby para leitores de tela anunciarem a mensagem de erro.
 */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error?.length && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>
      {children({ id, "aria-invalid": error?.length ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error?.length && (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      )}
      {error?.length ? (
        <p id={errorId} className="text-danger text-xs font-medium">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "h-10 pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2", className)} {...props} />;
}
