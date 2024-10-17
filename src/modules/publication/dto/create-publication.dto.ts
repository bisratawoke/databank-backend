import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsDate, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreatePublicationDto {
    // Publication specific fields
    @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File;

    @ApiProperty({
        type: 'string',
        description: 'Name of the file including path',
        example: 'technical-docs/2024/document.pdf'
    })
    @IsString()
    fileName: string;

    @ApiProperty({
        type: 'string',
        description: 'MinIO bucket name',
        example: 'my-bucket'
    })
    @IsString()
    bucketName: string;

    @ApiPropertyOptional({
        type: 'string',
        description: 'Permanent URL to access the file',
        required: false,
        example: 'http://minio-server/my-bucket/technical-docs/2024/document.pdf'
    })
    @IsString()
    @IsOptional()
    permanentLink?: string;

    @ApiProperty({
        type: 'string',
        format: 'date-time',
        required: false,
        example: '2024-10-16T10:00:00.000Z'
    })
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    uploadDate?: Date;

    @ApiProperty({
        type: 'string',
        required: false,
        description: 'Reference to metastore document',
        example: '507f1f77bcf86cd799439011'
    })
    @IsString()
    @IsOptional()
    metastoreId?: string;

    // Metastore specific fields
    @ApiProperty({
        type: 'string',
        description: 'Description of the file',
        example: 'Technical documentation for Project X'
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string'
        },
        description: 'Keywords/tags for the file',
        example: ['technical', 'documentation', 'guide']
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
        example: 'application/pdf'
    })
    @IsNotEmpty()
    @IsString()
    type: string;

    @ApiProperty({
        type: 'number',
        description: 'Size of the file in bytes',
        example: 1024
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    size: number;

    @ApiProperty({
        type: 'string',
        description: 'Storage location/path for the file',
        example: 'technical-docs/2024'
    })
    @IsNotEmpty()
    @IsString()
    location: string;

    @ApiProperty({
        type: 'string',
        format: 'date',
        description: 'Last modified date',
        example: '2024-10-16'
    })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value).toISOString())
    @IsDateString()
    modified_date: string;

    @ApiProperty({
        type: 'string',
        format: 'date',
        description: 'Creation date',
        example: '2024-10-16'
    })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value).toISOString())
    @IsDateString()
    created_date: string;
}