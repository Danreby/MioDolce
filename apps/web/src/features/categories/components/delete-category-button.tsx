"use client";

import { useActionState } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { idleState } from "@/lib/action-state";
import { deleteCategory } from "../actions";

export function DeleteCategoryButton({ id, name, disabled }: { id: number; name: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState(deleteCategory.bind(null, id), idleState);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Excluir a categoria "${name}"?`)) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        disabled={pending || disabled}
        title={disabled ? "Categorias com produtos não podem ser excluídas" : undefined}
        aria-label={`Excluir ${name}`}
      >
        <TrashIcon size={16} />
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-danger max-w-56 text-right text-xs">
          {state.message}
        </p>
      )}
    </form>
  );
}
