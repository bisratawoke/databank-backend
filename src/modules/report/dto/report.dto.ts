import { IsNotEmpty, IsString, IsDate, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Status } from '../schemas/report.schema'; // Ensure this enum exists

export class ReportDto {
  @ApiProperty({
    description: 'Name of the report',
    example: 'Annual Sales Report',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Description of the report',
    example: 'A report on annual sales performance.',
  })
  @IsString()
  readonly description: string;

  @ApiProperty({
    description: 'Start date of the report',
    example: '2023-01-01T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly start_date: Date;

  @ApiProperty({
    description: 'End date of the report',
    example: '2023-12-31T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly end_date: Date;

  @ApiProperty({
    description: 'List of field IDs associated with the report',
    example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
  })
  @IsArray()
  readonly fields: string[];

  @ApiProperty({
    description: 'List of data IDs associated with the report',
    example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
  })
  @IsArray()
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
}
