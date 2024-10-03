import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { UpdateDataDto } from 'src/modules/data/dto/update-data.dto';
import { ReportDto } from './report.dto';


export class UpdateReportDataDto {
    @ApiPropertyOptional({ description: 'ID of the data entry', example: '66fd34f4aee3c5d7a39773ba' })
    @IsOptional()
    @IsMongoId()
    readonly _id?: string;

    @ApiPropertyOptional({ description: 'ID of the FieldType associated with this data entry', example: '66f2a95d647374ca369dd24d' })
    @IsOptional()
    @IsMongoId()
    readonly field?: string;

    @ApiPropertyOptional({ description: 'Value of the data entry', example: 'Updated Value' })
    @IsOptional()
    readonly value: string;
}


export class UpdateReportDto {
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
        description: 'List of updated data entries',
        type: [UpdateReportDataDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateReportDataDto)
    readonly data?: UpdateReportDataDto[];

    // @ApiPropertyOptional({
    //     description: 'List of data IDs associated with the report (optional)',
    //     example: ['66f2a95d647374ca369dd24d', '66f2b098edd4bbb56ab3db2e'],
    // })
    // @IsArray()
    // readonly data?: string[];
}

