// src/category/dto/update-category.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Name of the category',
    example: 'Home Appliances',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'List of SubCategory IDs associated with this category',
    example: ['60d21b4667d0d8992e610c85'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subcategory?: Types.ObjectId[];
}
