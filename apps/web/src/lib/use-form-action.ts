"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { idleState, type ActionState } from "./action-state";

type FormServerAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * useActionState + um detalhe importante: quando um <form action={...}>
 * termina, o React 19 reseta os campos automaticamente. Num erro de
 * validação isso apagaria o que a pessoa digitou (e selects não voltam
 * bem nem com defaultValue). Interceptando o onSubmit e disparando a action
 * numa transition, não há reset. O `action` continua no form para funcionar
 * mesmo sem JavaScript (progressive enhancement).
 */
export function useFormAction(action: FormServerAction) {
  const [state, formAction, pending] = useActionState(action, idleState);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return { state, pending, formProps: { action: formAction, onSubmit } };
}
