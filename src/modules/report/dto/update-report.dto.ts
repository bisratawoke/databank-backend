import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
    @ApiPropertyOptional({
        description: 'Name of the report (optional)',
        example: 'Updated Annual Sales Report',
    })
    readonly name?: string;

    @ApiPropertyOptional({
        description: 'Description of the report (optional)',
        example: 'An updated report on annual sales performance.',
    })
    readonly description?: string;

    @ApiPropertyOptional({
        description: 'Start date of the report (optional)',
        example: '2023-01-01T00:00:00Z',
    })
    readonly start_date?: Date;

    @ApiPropertyOptional({
        description: 'End date of the report (optional)',
        example: '2023-12-31T00:00:00Z',
    })
    readonly end_date?: Date;

    @ApiPropertyOptional({
        description: 'List of field IDs associated with the report (optional)',
        example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
        type: [String]
    })
    readonly fields?: string[];

    @ApiPropertyOptional({
        description: 'List of data IDs associated with the report (optional)',
        example: ['66f2a1f4f7e8da23c52f392f'],
        type: [String]
    })
    readonly data?: string[];
}
