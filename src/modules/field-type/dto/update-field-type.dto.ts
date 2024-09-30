import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFieldTypeDto {
  @ApiPropertyOptional({ description: 'The name of the field type' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
