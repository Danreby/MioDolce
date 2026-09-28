"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState } from "@/lib/form-state";
import { deleteProduct } from "../actions";

/** A API recusa (409) se houver histórico; a mensagem dela aparece aqui mesmo. */
export function DeleteProductForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(deleteProduct, idleState);

  return (
    <form
      action={formAction}
      className="grid max-w-3xl gap-3 rounded-lg border border-danger/30 p-5"
      onSubmit={(event) => {
        if (!confirm("Excluir este produto definitivamente?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <div className="grid gap-1">
        <h2 className="text-[15px] font-semibold text-ink">Excluir produto</h2>
        <p className="text-sm text-muted">
          Só é possível excluir produtos que nunca foram movimentados. Com histórico, arquive-o desmarcando &quot;Produto ativo&quot;.
        </p>
      </div>
      <FormAlert message={state.message} />
      <div>
        <SubmitButton variant="danger" pendingLabel="Excluindo...">
          Excluir produto
        </SubmitButton>
      </div>
    </form>
  );
}
