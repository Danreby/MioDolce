"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";
import type { ComponentProps } from "react";

/**
 * Botão de submit que se desabilita enquanto a Server Action roda.
 * useFormStatus cobre forms com `action`; `pending` cobre o envio via
 * onSubmit do hook useFormAction.
 */
export function SubmitButton({
  children,
  pending: pendingProp,
  pendingLabel = "Salvando...",
  variant = "primary",
  ...props
}: ComponentProps<typeof Button> & { pending?: boolean; pendingLabel?: string }) {
  const status = useFormStatus();
  const pending = pendingProp || status.pending;
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
