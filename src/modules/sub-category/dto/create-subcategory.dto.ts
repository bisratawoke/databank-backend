// src/subcategories/dto/create-subcategory.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubCategoryDto {
  @ApiProperty({
    description: 'Name of the subcategory',
    example: 'Smartphones',
    type: String,
  })
  @IsNotEmpty({ message: 'SubCategory name is required.' })
  @IsString({ message: 'SubCategory name must be a string.' })
  readonly name: string;

  @ApiProperty({
    description: 'Array of Report ObjectIds associated with the subcategory',
    example: ['60d5f483f8d2e024dcf1e9a5', '60d5f483f8d2e024dcf1e9a6'],
    type: [String],
    required: false, // Assuming it's optional; adjust as needed
  })
  @IsArray({ message: 'Category must be an array of ObjectIds.' })
  @ArrayNotEmpty({ message: 'Category array cannot be empty.' })
  @IsMongoId({
    each: true,
    message: 'Each category ID must be a valid MongoDB ObjectId.',
  })
  readonly category: string[]; // Array of Report ObjectIds as strings
}
