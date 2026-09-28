"use client";

import { useActionState } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { idleState } from "@/lib/form-state";
import { deleteCategory } from "../actions";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState(deleteCategory, idleState);

  return (
    <form
      action={formAction}
      className="grid justify-items-end gap-1"
      onSubmit={(event) => {
        if (!confirm(`Excluir a categoria "${name}"?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" disabled={pending} aria-label={`Excluir ${name}`} className="h-8 px-2">
        <TrashIcon size={16} aria-hidden />
      </Button>
      {state.message ? (
        <p role="alert" className="max-w-56 text-right text-xs text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
