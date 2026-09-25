"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, ScalesIcon } from "@phosphor-icons/react";
import { Field, Input, Select } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/lib/use-form-action";
import { cn } from "@/lib/cn";
import { UNIT_LABEL } from "@/lib/format";
import type { MovementType } from "@/lib/types";
import type { ProductOption } from "@/features/products/api";
import { createMovement } from "../actions";

const TYPES: { value: MovementType; label: string; icon: typeof ArrowUpIcon; quantityLabel: string; hint: string }[] = [
  { value: "IN", label: "Entrada", icon: ArrowDownIcon, quantityLabel: "Quantidade recebida", hint: "Soma ao saldo." },
  { value: "OUT", label: "Saída", icon: ArrowUpIcon, quantityLabel: "Quantidade retirada", hint: "Subtrai do saldo." },
  { value: "ADJUSTMENT", label: "Ajuste", icon: ScalesIcon, quantityLabel: "Saldo contado", hint: "O saldo passa a ser exatamente este valor." },
];

interface MovementFormProps {
  /** Com um produto fixo (página do produto) o select some. */
  product?: ProductOption;
  products?: ProductOption[];
}

export function MovementForm({ product, products = [] }: MovementFormProps) {
  const { state, pending, formProps } = useFormAction(createMovement);
  const [type, setType] = useState<MovementType>((state.values?.type as MovementType) ?? "IN");
  const [productId, setProductId] = useState(state.values?.productId ?? (product ? String(product.id) : ""));
  const current = TYPES.find((t) => t.value === type)!;
  const selected = product ?? products.find((p) => String(p.id) === productId);

  return (
    <form key={state.message ?? "form"} {...formProps} noValidate className="flex flex-col gap-4">
      {product ? (
        <input type="hidden" name="productId" value={product.id} />
      ) : (
        <Field label="Produto" error={state.fieldErrors?.productId}>
          {(a) => (
            <Select name="productId" value={productId} onChange={(e) => setProductId(e.target.value)} {...a}>
              <option value="">Escolha...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} | {p.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Tipo</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-xs border px-2 py-2.5 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
                type === t.value ? "border-ink bg-ink text-panel font-medium" : "border-line-strong text-ink-2 hover:border-ink-2",
              )}
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="sr-only"
              />
              <t.icon size={18} weight={type === t.value ? "bold" : "regular"} />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label={current.quantityLabel}
        error={state.fieldErrors?.quantity}
        hint={selected ? `${current.hint} Saldo atual: ${selected.quantity} ${UNIT_LABEL[selected.unit]}.` : current.hint}
      >
        {(a) => (
          <Input
            name="quantity"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={state.values?.quantity}
            className="font-mono"
            {...a}
          />
        )}
      </Field>

      <Field label="Observação" error={state.fieldErrors?.note}>
        {(a) => <Input name="note" maxLength={255} defaultValue={state.values?.note} placeholder="Ex.: NF 4821, venda balcão" {...a} />}
      </Field>

      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingLabel="Registrando...">Registrar {current.label.toLowerCase()}</SubmitButton>
    </form>
  );
}
