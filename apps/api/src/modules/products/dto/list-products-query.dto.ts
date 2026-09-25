import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { toBoolean } from '../../../common/transforms.js';

export const STOCK_STATUSES = ['ok', 'low', 'out'] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export class ListProductsQueryDto extends PaginationQueryDto {
  /** Busca por nome ou SKU. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  /** ok = acima do mínimo, low = no mínimo ou abaixo, out = zerado. */
  @IsOptional()
  @IsIn(STOCK_STATUSES)
  status?: StockStatus;

  /** `true` lista apenas os produtos arquivados. */
  @IsOptional()
  @Transform(toBoolean)
  archived: boolean = false;
}
