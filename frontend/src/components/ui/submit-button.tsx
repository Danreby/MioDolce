"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

/**
 * useFormStatus lê o estado do <form> pai: enquanto a Server Action roda,
 * o botão fica desabilitado e troca o texto. Precisa ser Client Component.
 */
export function SubmitButton({
  children,
  pendingLabel = "Salvando...",
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
