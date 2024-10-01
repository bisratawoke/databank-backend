// src/departments/dto/search-department.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class SearchDepartmentDto {
  @IsOptional()
  @IsString()
  readonly name?: string;
}
