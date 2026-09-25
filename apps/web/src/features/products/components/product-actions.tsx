"use client";

import { useActionState, useTransition } from "react";
import { ArchiveIcon, ArrowCounterClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { idleState, type ActionState } from "@/lib/action-state";
import { deleteProduct, setProductActive } from "../actions";

/** Arquivar/reativar: chamada de Server Action a partir de um onClick, sem <form>. */
export function ArchiveProductButton({ id, active }: { id: number; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(async () => void (await setProductActive(id, !active)))}
    >
      {active ? <ArchiveIcon size={16} /> : <ArrowCounterClockwiseIcon size={16} />}
      {active ? "Arquivar" : "Reativar"}
    </Button>
  );
}

/** Excluir: só aparece para produtos sem histórico (a API também bloqueia). */
export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [state, action, pending] = useActionState<ActionState>(deleteProduct.bind(null, id), idleState);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Excluir "${name}" definitivamente?`)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="danger" disabled={pending}>
        <TrashIcon size={16} />
        Excluir
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-danger mt-1 text-xs">
          {state.message}
        </p>
      )}
    </form>
  );
}
