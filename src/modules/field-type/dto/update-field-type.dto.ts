import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFieldTypeDto {
  @ApiPropertyOptional({ description: 'The name of the field type' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'A description of the field type' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'An example value for the field type' })
  @IsOptional()
  exampleValue?: string;
}
