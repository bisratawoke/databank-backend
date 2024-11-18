// src/departments/dto/update-department.dto.ts

import { IsOptional, IsString, IsArray, IsMongoId } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  readonly category?: string[];
  @IsOptional()
  @IsMongoId({ message: 'Head must be a valid MongoDB ObjectId.' })
  readonly head?: string;
}
