import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Query string de paginação. Outros DTOs de listagem estendem esta classe. */
export class PaginationQueryDto {
  /** Página atual, começando em 1. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Itens por página. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function paginate<T>(data: T[], total: number, query: PaginationQueryDto): Paginated<T> {
  return {
    data,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}
