import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFieldTypeDto {
  @ApiProperty({ description: 'The name of the field type' })
  @IsNotEmpty()
  name: string;
}
