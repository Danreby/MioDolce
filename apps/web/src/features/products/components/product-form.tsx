"use client";

import { ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/action-state";
import { useFormAction } from "@/lib/use-form-action";
import { UNIT_OPTIONS } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}

/** Mesmo formulário para criar e editar; quem chama decide qual action usar. */
export function ProductForm({ categories, product, action }: ProductFormProps) {
  const { state, pending, formProps } = useFormAction(action);
  const errors = state.fieldErrors ?? {};
  const value = (key: string, fallback?: string | number | null) => state.values?.[key] ?? (fallback == null ? "" : String(fallback));

  return (
    <form {...formProps} noValidate className="flex flex-col gap-8">
      <fieldset className="grid gap-5 md:grid-cols-[180px_1fr]">
        <legend className="display mb-4 text-lg font-semibold">Identificação</legend>
        <Field label="SKU" error={errors.sku} hint="Código da etiqueta.">
          {(a) => <Input name="sku" defaultValue={value("sku", product?.sku)} className="font-mono uppercase" maxLength={32} autoComplete="off" {...a} />}
        </Field>
        <Field label="Nome" error={errors.name}>
          {(a) => <Input name="name" defaultValue={value("name", product?.name)} maxLength={120} {...a} />}
        </Field>
        <Field label="Descrição" error={errors.description} className="md:col-span-2">
          {(a) => <Textarea name="description" defaultValue={value("description", product?.description)} {...a} />}
        </Field>
        <Field label="Categoria" error={errors.categoryId}>
          {(a) => (
            <Select name="categoryId" defaultValue={value("categoryId", product?.categoryId)} {...a}>
              <option value="">Escolha...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Unidade" error={errors.unit} className="md:col-start-1">
          {(a) => (
            <Select name="unit" defaultValue={value("unit", product?.unit ?? "UN")} {...a}>
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </fieldset>

      <fieldset className="border-line grid gap-5 border-t pt-6 sm:grid-cols-2 md:grid-cols-4">
        <legend className="display float-left mb-4 w-full text-lg font-semibold">Preço e estoque</legend>
        <Field label="Custo (R$)" error={errors.costPrice}>
          {(a) => <Input name="costPrice" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={value("costPrice", product?.costPrice)} className="font-mono" {...a} />}
        </Field>
        <Field label="Venda (R$)" error={errors.salePrice}>
          {(a) => <Input name="salePrice" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={value("salePrice", product?.salePrice)} className="font-mono" {...a} />}
        </Field>
        <Field label="Estoque mínimo" error={errors.minQuantity} hint="Abaixo disso, alerta.">
          {(a) => <Input name="minQuantity" type="number" step="1" min="0" defaultValue={value("minQuantity", product?.minQuantity ?? 0)} className="font-mono" {...a} />}
        </Field>
        {!product && (
          <Field label="Saldo inicial" error={errors.initialQuantity} hint="Vira uma entrada no histórico.">
            {(a) => <Input name="initialQuantity" type="number" step="1" min="0" defaultValue={value("initialQuantity")} placeholder="0" className="font-mono" {...a} />}
          </Field>
        )}
      </fieldset>

      <FormMessage state={state} />

      <div className="flex gap-2">
        <SubmitButton pending={pending}>{product ? "Salvar alterações" : "Cadastrar produto"}</SubmitButton>
        <ButtonLink href={product ? `/produtos/${product.id}` : "/produtos"} variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
