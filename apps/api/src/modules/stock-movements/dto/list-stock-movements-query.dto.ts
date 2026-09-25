import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { MovementType } from '../../../generated/prisma/enums.js';

export class ListStockMovementsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;
}
