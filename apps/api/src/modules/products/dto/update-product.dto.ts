import { OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto.js';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['initialQuantity'] as const),
) {
  /** `false` arquiva o produto: some das listagens padrão e não aceita movimentações. */
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
