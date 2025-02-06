import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ADMIN_UNITS } from '../schemas/publication-request.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicationRequestDto {
  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  preferredDataFormat: string;

  @IsString()
  purposeForResearch: string;

  @IsString()
  dateImportance: string;
  @IsString()
  dataSpecification: string;

  @IsEnum(ADMIN_UNITS)
  adminUnits: ADMIN_UNITS;

  @ApiProperty({
    description: 'Optional file attachment',
    type: 'string',
    format: 'binary', // Indicates file upload
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;
}
