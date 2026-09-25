import { CheckCircleIcon, WarningOctagonIcon } from "@phosphor-icons/react/dist/ssr";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/cn";

/** Mensagem geral do formulário (sucesso ou erro vindo da API). */
export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  if (state.status === "idle" || !state.message) return null;
  const error = state.status === "error";
  const Icon = error ? WarningOctagonIcon : CheckCircleIcon;

  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xs border px-3 py-2 text-sm",
        error ? "border-danger/40 bg-danger-soft text-ink" : "border-line bg-sunken text-ink",
        className,
      )}
    >
      <Icon size={18} weight="bold" className={cn("mt-px shrink-0", error && "text-danger")} />
      {state.message}
    </p>
  );
}
