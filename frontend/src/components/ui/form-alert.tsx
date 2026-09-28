import { WarningCircleIcon } from "@phosphor-icons/react/ssr";

/** Mensagem geral de erro do formulário (ex.: "Estoque insuficiente..."). role=alert é anunciado. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2.5 text-sm text-danger">
      <WarningCircleIcon size={18} weight="bold" className="mt-px shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
