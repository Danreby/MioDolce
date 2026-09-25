import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Unit } from '../../../generated/prisma/enums.js';
import { trim } from '../../../common/transforms.js';

export class CreateProductDto {
  /** Código interno do produto. Letras maiúsculas, números e hífen. */
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @Matches(/^[A-Z0-9-]{3,32}$/, { message: 'SKU deve ter 3 a 32 caracteres: A-Z, 0-9 ou hífen' })
  sku: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  description?: string;

  @IsEnum(Unit)
  unit: Unit = Unit.UN;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice: number;

  /** Com saldo igual ou abaixo deste valor o produto aparece como "estoque baixo". */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minQuantity: number = 0;

  @Type(() => Number)
  @IsInt()
  categoryId: number;

  /**
   * Saldo inicial. Não existe campo `quantity` editável: o saldo só muda por
   * movimentações, então o valor inicial vira uma movimentação de entrada.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  initialQuantity?: number;
}
