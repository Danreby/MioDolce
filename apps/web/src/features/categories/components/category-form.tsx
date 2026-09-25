"use client";

import { Field, Input, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { ButtonLink } from "@/components/ui/button";
import { useFormAction } from "@/lib/use-form-action";
import type { Category } from "@/lib/types";
import { saveCategory } from "../actions";

export function CategoryForm({ category }: { category?: Category }) {
  const { state, pending, formProps } = useFormAction(saveCategory.bind(null, category?.id ?? null));
  const value = (key: "name" | "description") => state.values?.[key] ?? category?.[key] ?? "";

  return (
    // key força o form a remontar após sucesso, limpando os campos.
    <form key={state.status === "success" ? state.message : "form"} {...formProps} className="flex flex-col gap-4">
      <Field label="Nome" error={state.fieldErrors?.name}>
        {(a) => <Input name="name" defaultValue={value("name")} maxLength={80} autoComplete="off" {...a} />}
      </Field>
      <Field label="Descrição" hint="Opcional. Ajuda a decidir onde cadastrar cada produto." error={state.fieldErrors?.description}>
        {(a) => <Textarea name="description" defaultValue={value("description")} maxLength={255} {...a} />}
      </Field>
      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton pending={pending}>{category ? "Salvar alterações" : "Criar categoria"}</SubmitButton>
        {category && (
          <ButtonLink href="/categorias" variant="ghost">
            Cancelar
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
