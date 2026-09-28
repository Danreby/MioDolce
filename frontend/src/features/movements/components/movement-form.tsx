"use client";

import { useActionState, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { describedBy, Field, Input } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState } from "@/lib/form-state";
import { registerMovement, type MovementFormState } from "../actions";
import { movementHints, movementLabels } from "../labels";
import { movementTypes, type MovementType } from "../types";

/**
 * O tipo escolhido muda o significado do campo de quantidade (no ajuste é o saldo CONTADO),
 * por isso guardamos o tipo em estado local para trocar rótulo e dica na hora.
 */
export function MovementForm({ productId, unitLabel }: { productId: string; unitLabel: string }) {
  const [state, formAction] = useActionState<MovementFormState, FormData>(registerMovement, idleState);
  const [type, setType] = useState<MovementType>((state.values?.type as MovementType) ?? "Entry");
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="productId" value={productId} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Tipo</legend>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-sunken p-1">
          {movementTypes.map((option) => (
            <label
              key={option}
              className="relative cursor-pointer rounded-[5px] px-2 py-1.5 text-center text-sm text-ink-2 transition-colors has-checked:bg-surface has-checked:font-medium has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-accent"
            >
              {/*
                ATENÇÃO (pegadinha do React 19): após uma Server Action o React RESETA o <form>.
                Com radio controlado (checked=...), o DOM voltava para "Entrada" enquanto o estado
                continuava "Saída", e o próximo envio mandava o tipo errado. Com defaultChecked
                acompanhando o estado, o reset restaura a opção que está selecionada agora.
              */}
              <input
                type="radio"
                name="type"
                value={option}
                defaultChecked={type === option}
                onChange={() => setType(option)}
                className="sr-only"
              />
              {movementLabels[option]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{movementHints[type]}</p>
      </fieldset>

      <Field label={type === "Adjustment" ? `Saldo contado (${unitLabel})` : `Quantidade (${unitLabel})`} htmlFor="quantity" errors={errors.quantity}>
        <Input
          {...describedBy("quantity", errors.quantity)}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.001"
          defaultValue={state.values?.quantity ?? ""}
          required
        />
      </Field>

      <Field label="Observação" htmlFor="note" hint="Opcional. Ex.: número da nota, encomenda." errors={errors.note}>
        <Input {...describedBy("note", errors.note, true)} defaultValue={state.values?.note ?? ""} maxLength={200} />
      </Field>

      <FormAlert message={state.message} />
      {state.summary ? (
        <p key={state.savedAt} role="status" className="flex items-center gap-2 text-sm text-ink-2">
          <CheckCircleIcon size={16} weight="bold" className="text-accent" aria-hidden />
          {state.summary}
        </p>
      ) : null}

      <div>
        <SubmitButton pendingLabel="Registrando...">Registrar {movementLabels[type].toLowerCase()}</SubmitButton>
      </div>
    </form>
  );
}
