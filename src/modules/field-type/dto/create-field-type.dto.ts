import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFieldTypeDto {
  @ApiProperty({ description: 'The name of the field type' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'A description of the field type' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'An example value for the field type' })
  @IsOptional()
  exampleValue?: string;
}
