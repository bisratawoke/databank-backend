// src/categories/dto/create-category.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
    type: String,
  })
  @IsNotEmpty({ message: 'Category name is required.' })
  @IsString({ message: 'Category name must be a string.' })
  readonly name: string;
}
