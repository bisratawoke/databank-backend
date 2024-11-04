import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';

enum PUBLICATION_TYPE {
  PUBLIC,
  INTERNAL,
  FOR_SALE,
}

export class UpdatePublicationDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Name of the file including path',
    example: 'technical-docs/2024/document.pdf',
  })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'MinIO bucket name',
    example: 'my-bucket',
  })
  @IsString()
  @IsOptional()
  bucketName?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Permanent URL to access the file',
    example: 'http://minio-server/my-bucket/technical-docs/2024/document.pdf',
  })
  @IsString()
  @IsOptional()
  permanentLink?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2024-10-16T10:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  uploadDate?: Date;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Reference to metastore document',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  metastoreId?: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: PUBLICATION_TYPE,
    description: 'Type of publication',
    example: 'PUBLIC',
  })
  @IsEnum(PUBLICATION_TYPE)
  @IsOptional()
  publicationType?: PUBLICATION_TYPE;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Department ID',
    example: '60c72b2f4f1a4e4fbc1a3d1e',
  })
  @IsString()
  @IsOptional()
  department?: string;
}
