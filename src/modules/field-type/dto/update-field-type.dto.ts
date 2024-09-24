import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFieldTypeDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
