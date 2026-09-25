import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { MovementType } from '../../../generated/prisma/enums.js';
import { trim } from '../../../common/transforms.js';

export class CreateStockMovementDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @IsEnum(MovementType)
  type: MovementType;

  /**
   * IN/OUT: quantidade que entra ou sai (mínimo 1).
   * ADJUSTMENT: saldo contado fisicamente; a API calcula a diferença.
   */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  note?: string;
}
