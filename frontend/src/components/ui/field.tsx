import type { ComponentProps, ReactNode } from "react";

export const controlStyles =
  "h-9 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink " +
  "placeholder:text-muted transition-colors hover:border-ink-2 " +
  "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 " +
  "aria-invalid:border-danger";

/**
 * Rótulo ACIMA do campo, dica opcional e erro ABAIXO. O id do erro é ligado ao input
 * via aria-describedby, então leitores de tela anunciam a mensagem.
 */
export function Field({
  label,
  htmlFor,
  hint,
  errors,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`grid content-start gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger">
          {errors.join(" ")}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Props de acessibilidade que todo controle dentro de <Field> deve receber. */
export function describedBy(id: string, errors?: string[], hasHint = false) {
  return {
    id,
    name: id,
    "aria-invalid": errors?.length ? true : undefined,
    "aria-describedby": errors?.length ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
  } as const;
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${controlStyles} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${controlStyles} pr-8 ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${controlStyles} h-auto min-h-20 py-2 ${props.className ?? ""}`} />;
}
