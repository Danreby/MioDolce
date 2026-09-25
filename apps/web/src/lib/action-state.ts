/**
 * Formato padrão de retorno das Server Actions usadas com `useActionState`.
 * Este arquivo é importado por Client Components, então não pode depender de
 * nada do servidor. Os helpers que usam a API ficam em action-helpers.ts.
 *
 * `values` devolve o que o usuário digitou: o React limpa o form após a
 * action, então sem isso um erro de validação apagaria tudo.
 */
export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
}

export const idleState: ActionState = { status: "idle" };
