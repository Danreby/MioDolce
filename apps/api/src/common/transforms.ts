import type { TransformFnParams } from 'class-transformer';

/** Remove espaços nas pontas de strings vindas do body. */
export const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** Query strings chegam como texto: "true" vira true, qualquer outra coisa false. */
export const toBoolean = ({ value }: TransformFnParams): boolean =>
  value === true || value === 'true';
