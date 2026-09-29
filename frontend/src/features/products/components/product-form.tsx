"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Category } from "@/features/categories/types";
import { idleState } from "@/lib/form-state";
import { createProduct, updateProduct } from "../actions";
import { unitLabels } from "../labels";
import { unitsOfMeasure, type Product } from "../types";

/**
 * Um formulário para criar e editar. useActionState liga o <form> à Server Action
 * e devolve o último estado (erros por campo vindos da API + valores digitados).
 */
export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const editing = product !== undefined;
  const [state, formAction] = useActionState(editing ? updateProduct : createProduct, idleState);

  const errors = state.fieldErrors ?? {};
  // Após um erro, reexibe o que foi digitado; senão, os dados atuais do produto.
  const value = (name: string, fallback: string | number | null | undefined) =>
    state.values?.[name] ?? (fallback === null || fallback === undefined ? "" : String(fallback));

  return (
    <form action={formAction} className="grid max-w-3xl gap-8" noValidate>
      <FormAlert message={state.message} />
      {editing ? <input type="hidden" name="id" value={product.id} /> : null}

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-[15px] font-semibold text-ink">Identificação</legend>

        {editing ? (
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-ink">SKU</span>
            <p className="flex h-9 items-center font-mono text-sm text-ink-2">{product.sku}</p>
          </div>
        ) : (
          <Field label="SKU" htmlFor="sku" hint="Código único. Letras, números e hífen." errors={errors.sku}>
            <Input
              {...describedBy("sku", errors.sku, true)}
              defaultValue={value("sku", "")}
              autoComplete="off"
              className="font-mono uppercase"
              required
            />
          </Field>
        )}

        <Field label="Nome" htmlFor="name" errors={errors.name}>
          <Input {...describedBy("name", errors.name)} defaultValue={value("name", product?.name)} required />
        </Field>

        <Field label="Categoria" htmlFor="categoryId" errors={errors.categoryId}>
          <Select {...describedBy("categoryId", errors.categoryId)} defaultValue={value("categoryId", product?.categoryId)} required>
            <option value="" disabled>
              Selecione
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Código de barras" htmlFor="barcode" hint="Opcional. EAN de 8 a 14 dígitos." errors={errors.barcode}>
          <Input
            {...describedBy("barcode", errors.barcode, true)}
            defaultValue={value("barcode", product?.barcode)}
            inputMode="numeric"
            autoComplete="off"
            className="font-mono"
          />
        </Field>

        <Field label="Descrição" htmlFor="description" hint="Opcional." errors={errors.description} className="md:col-span-2">
          <Textarea {...describedBy("description", errors.description, true)} defaultValue={value("description", product?.description)} rows={3} />
        </Field>
      </fieldset>

      <fieldset className={`grid gap-5 ${editing ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
        <legend className="mb-4 text-[15px] font-semibold text-ink">Custo e estoque</legend>

        <Field label="Unidade de medida" htmlFor="unit" errors={errors.unit}>
          <Select {...describedBy("unit", errors.unit)} defaultValue={value("unit", product?.unit ?? "Unit")}>
            {unitsOfMeasure.map((unit) => (
              <option key={unit} value={unit}>
                {unitLabels[unit]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Custo unitário (R$)" htmlFor="unitCost" errors={errors.unitCost}>
          <Input {...describedBy("unitCost", errors.unitCost)} type="number" inputMode="decimal" min={0} step="0.01" defaultValue={value("unitCost", product?.unitCost ?? 0)} />
        </Field>

        <Field label="Estoque mínimo" htmlFor="minimumStock" hint="Abaixo disso, o produto entra em alerta." errors={errors.minimumStock}>
          <Input {...describedBy("minimumStock", errors.minimumStock, true)} type="number" inputMode="decimal" min={0} step="0.001" defaultValue={value("minimumStock", product?.minimumStock ?? 0)} />
        </Field>

        {editing ? null : (
          <Field label="Saldo inicial" htmlFor="initialQuantity" hint="Vira a primeira entrada do histórico." errors={errors.initialQuantity}>
            <Input {...describedBy("initialQuantity", errors.initialQuantity, true)} type="number" inputMode="decimal" min={0} step="0.001" defaultValue={value("initialQuantity", 0)} />
          </Field>
        )}
      </fieldset>

      {editing ? (
        <label className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={state.values ? state.values.isActive === "on" : product.isActive}
            className="mt-0.5 size-4 accent-accent"
          />
          <span className="grid gap-0.5 text-sm">
            <span className="font-medium text-ink">Produto ativo</span>
            <span className="text-muted">Desmarque para arquivar. Arquivados somem das listas e não recebem movimentações.</span>
          </span>
        </label>
      ) : null}

      <div className="flex gap-2 border-t border-line pt-6">
        <SubmitButton>{editing ? "Salvar alterações" : "Cadastrar produto"}</SubmitButton>
        <ButtonLink href={editing ? `/produtos/${product.id}` : "/produtos"} variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
