// src/subcategories/dto/update-subcategory.dto.ts

import { IsOptional, IsString, IsArray, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubCategoryDto {
  @ApiPropertyOptional({
    description: 'Optional new name of the subcategory',
    example: 'Feature Phones',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'SubCategory name must be a string.' })
  readonly name?: string;

  @ApiPropertyOptional({
    description:
      'Optional array of Report ObjectIds associated with the subcategory',
    example: ['60d5f483f8d2e024dcf1e9a5', '60d5f483f8d2e024dcf1e9a6'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Category must be an array of ObjectIds.' })
  @IsMongoId({
    each: true,
    message: 'Each category ID must be a valid MongoDB ObjectId.',
  })
  readonly report?: string[]; // Array of Report ObjectIds as strings
}
