import { ApiProperty } from '@nestjs/swagger';
import { ReportDto } from './report.dto';
import { Type } from 'class-transformer';
import { UpdateDataDto } from 'src/modules/data/dto/update-data.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateDataDto } from 'src/modules/data/dto/create-data.dto';

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

    @ApiProperty({
        description: 'List of data IDs associated with the report',
        example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
    })
    readonly data?: string[];
}
