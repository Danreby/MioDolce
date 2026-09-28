/**
 * Estado devolvido por toda Server Action de formulário (consumido com useActionState).
 * Fica fora do "server-only" porque os Client Components também usam o tipo e o estado inicial.
 * `values` devolve o que o usuário digitou, para o formulário não "esvaziar" após um erro.
 */
export type FormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

export const idleState: FormState = { status: "idle" };
