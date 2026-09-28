"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { describedBy, Field, Input, Textarea } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState } from "@/lib/form-state";
import { saveCategory } from "../actions";
import type { Category } from "../types";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction] = useActionState(saveCategory, idleState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <FormAlert message={state.message} />

      <Field label="Nome" htmlFor="name" errors={errors.name}>
        <Input {...describedBy("name", errors.name)} defaultValue={state.values?.name ?? category?.name ?? ""} required />
      </Field>

      <Field label="Descrição" htmlFor="description" hint="Opcional." errors={errors.description}>
        <Textarea
          {...describedBy("description", errors.description, true)}
          defaultValue={state.values?.description ?? category?.description ?? ""}
          rows={3}
        />
      </Field>

      <div className="flex gap-2">
        <SubmitButton>{category ? "Salvar" : "Criar categoria"}</SubmitButton>
        {category ? (
          <ButtonLink href="/categorias" variant="ghost">
            Cancelar
          </ButtonLink>
        ) : null}
      </div>
    </form>
  );
}
