import {
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsMongoId,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFieldDto {
  @ApiProperty({ description: 'The name of the field' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The ID of the field type', type: String })
  @IsNotEmpty()
  @IsMongoId()
  type: string;

  @ApiProperty({
    description: 'Indicates if the field is filtered',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  filtered?: boolean = false;

  @ApiProperty({
    description: 'Indicates if the field is required',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ description: 'The description of the field', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The default value of the field',
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultValue?: string;
}
