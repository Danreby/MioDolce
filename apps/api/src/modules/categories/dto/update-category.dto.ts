import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto.js';

// PartialType copia as validações do DTO de criação e torna tudo opcional.
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
