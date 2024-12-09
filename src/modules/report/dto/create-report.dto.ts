// dto/create-report-dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportDto } from './report.dto';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Status } from '../schemas/report.schema';

export class CreateReportDto extends ReportDto {
  @ApiProperty({
    description: 'Name of the report',
    example: 'Updated Annual Sales Report',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Description of the report',
    example: 'An updated report on annual sales performance.',
  })
  readonly description: string;

  @ApiProperty({
    description: 'Start date of the report',
    example: '2023-01-01T00:00:00Z',
  })
  @Type(() => Date)
  readonly start_date: Date;

  @ApiProperty({
    description: 'End date of the report',
    example: '2023-12-31T00:00:00Z',
  })
  @Type(() => Date)
  readonly end_date: Date;

  @ApiProperty({
    description: 'List of field IDs associated with the report',
    example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
  })
  readonly fields: string[];

  @ApiPropertyOptional({
    description: 'List of data IDs associated with the report',
    example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
  })
  readonly data?: string[];

  @ApiProperty({
    description: 'Status of the report',
    example: 'pending',
    enum: Status,
    default: Status.Pending,
  })
  @IsEnum(Status)
  readonly status: Status = Status.Pending;

  @ApiProperty({
    description: 'Status of the data in the report',
    example: 'pending',
    enum: Status,
    default: Status.Pending,
  })
  @IsEnum(Status)
  readonly data_status: Status = Status.Pending;

  @ApiPropertyOptional({
    description: 'Author of the report',
    example: 'user123',
  })
  readonly author: string;

  // New optional fields
  @ApiPropertyOptional({
    description:
      'Information on the accuracy, reliability, and limitations of the dataset.',
    example: 'Some limitations apply due to incomplete data collection.',
  })
  @IsOptional()
  @IsString()
  readonly data_quality_limitations?: string;

  @ApiPropertyOptional({
    description: 'The specific years or time periods that the dataset covers.',
    example: '2020-2023',
  })
  @IsOptional()
  @IsString()
  readonly time_coverage?: string;

  @ApiPropertyOptional({
    description: 'How often the dataset is updated and made available.',
    example: 'Annually',
  })
  @IsOptional()
  @IsString()
  readonly update_frequency?: string;

  @ApiPropertyOptional({
    description:
      'Information on who can access the data and any restrictions on usage.',
    example: 'Restricted to internal teams.',
  })
  @IsOptional()
  @IsString()
  readonly access_restrictions?: string;

  @ApiPropertyOptional({
    description: 'Amount of payment if the data is for sale.',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  readonly payment_amount?: number;

  @ApiPropertyOptional({
    description:
      'Licensing information or terms and conditions for data usage.',
    example: 'Data usage is governed by the company’s licensing agreement.',
  })
  @IsOptional()
  @IsString()
  readonly licenses_terms_of_use?: string;

  @ApiPropertyOptional({
    description: 'Details for support or inquiries related to the data.',
    example: 'support@company.com',
  })
  @IsOptional()
  @IsString()
  readonly contact_information?: string;

  @ApiPropertyOptional({
    description: 'Formats in which the dataset can be downloaded or accessed.',
    example: ['CSV', 'Excel', 'JSON'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly file_formats_available?: string[];

  @ApiPropertyOptional({
    description: 'Enable or disable API access for this dataset.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly api_access?: boolean;

  @ApiPropertyOptional({
    description:
      'Detailed information on the data structure for systems to interpret the dataset accurately.',
    example:
      'The dataset follows a tabular structure with well-defined headers.',
  })
  @IsOptional()
  @IsString()
  readonly data_structure_information?: string;
}
