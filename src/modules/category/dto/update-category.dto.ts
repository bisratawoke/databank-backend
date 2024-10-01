// src/categories/dto/update-category.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Optional new name of the category',
    example: 'Home Electronics',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string.' })
  readonly name?: string;
}
