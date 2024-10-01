// src/departments/dto/update-department.dto.ts
import { IsOptional, IsString, IsArray, IsMongoId } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  readonly category?: string[]; // Array of Category ObjectIds as strings
}
