import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

enum PUBLICATION_TYPE {
  PUBLIC,
  INTERNAL,
  FOR_SALE,
}

export class CreatePublicationDto {
  // @ApiProperty({ type: 'string', format: 'binary' })
  // files: Express.Multer.File[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Cover image file',
  })
  coverImage: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Main file to upload',
  })
  file: Express.Multer.File;
  @ApiProperty({
    type: 'string',
    description: 'Name of the file including path',
    example: 'technical-docs/2024/document.pdf',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    type: 'string',
    description: 'MinIO bucket name',
    example: 'my-bucket',
  })
  @IsString()
  bucketName: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Permanent URL to access the file',
    example: 'http://minio-server/my-bucket/technical-docs/2024/document.pdf',
  })
  @IsString()
  @IsOptional()
  permanentLink?: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2024-10-16T10:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  uploadDate?: Date;

  @ApiProperty({
    type: 'string',
    description: 'Reference to metastore document',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  metastoreId?: string;

  @ApiProperty({
    type: 'string',
    description: 'Title of the Publication',
    example: 'Technical documentation for Project X',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    description: 'Description of the file',
    example: 'Technical documentation for Project X',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    description: 'Keywords/tags for the file',
    example: ['technical', 'documentation', 'guide'],
  })
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  @IsString({ each: true })
  keyword: string[];

  @ApiProperty({
    type: 'string',
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    type: 'number',
    description: 'Size of the file in bytes',
    example: 1024,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  size: number;

  @ApiProperty({
    type: 'string',
    description: 'Storage location/path for the file',
    example: 'technical-docs/2024',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    type: 'string',
    format: 'date',
    description: 'Last modified date',
    example: '2024-10-16',
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  modified_date: string;

  @ApiProperty({
    type: 'string',
    format: 'date',
    description: 'Creation date',
    example: '2024-10-16',
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  created_date: string;

  @ApiProperty({
    type: 'string',
    enum: PUBLICATION_TYPE,
    description: 'Type of publication',
    example: 'PUBLIC',
  })
  @IsEnum(PUBLICATION_TYPE)
  publicationType: PUBLICATION_TYPE;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Department ID',
    example: '60c72b2f4f1a4e4fbc1a3d1e',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Category Id',
    example: '60c72b2f4f1a4e4fbc1a3d1e',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'author Id',
    example: '60c72b2f4f1a4e4fbc1a3d1e',
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    type: 'boolean',
    description: 'This specifies if the publication requires payment',
    example: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  paymentRequired?: boolean;

  @ApiPropertyOptional({
    type: 'number',
    description: 'Price of publication',
    example: 2344,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  price?: number;

  // @ApiPropertyOptional({
  //   type: 'string',
  //   description: 'Link to cover image for the publication',
  //   example: 'http://localhost:8000/image.png',
  // })
  // @IsString()
  // @IsOptional()
  // coverImageLink: string;
}
