import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../../common/transforms.js';

export class CreateCategoryDto {
  /** Nome único da categoria. */
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  description?: string;
}
