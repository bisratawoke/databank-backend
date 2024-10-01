// src/departments/dto/create-department.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Name of the department',
    example: 'Human Resources',
    type: String,
  })
  @IsNotEmpty({ message: 'Department name is required.' })
  @IsString({ message: 'Department name must be a string.' })
  readonly name: string;

  @ApiProperty({
    description: 'Array of Category ObjectIds associated with the department',
    example: ['60d5f483f8d2e024dcf1e9a5', '60d5f483f8d2e024dcf1e9a6'],
    type: [String],
  })
  @IsArray({ message: 'Category must be an array of ObjectIds.' })
  @IsOptional()
  @IsMongoId({
    each: true,
    message: 'Each category ID must be a valid MongoDB ObjectId.',
  })
  readonly category: string[]; // Array of Category ObjectIds as strings
}
