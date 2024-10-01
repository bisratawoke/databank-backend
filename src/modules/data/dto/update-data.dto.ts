import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDataDto {
    @ApiProperty({ description: 'The ID of the FieldType associated with this data entry' })
    @IsOptional()
    @IsString()
    readonly field?: string;

    @ApiProperty({ description: 'The actual value of the data entry', required: false })
    @IsOptional()
    @IsString()
    readonly value?: string;
}

export class UpdateMultipleDataDto {
    @ApiProperty({ description: 'An array of data entries', type: [UpdateDataDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateDataDto)
    readonly dataEntries: UpdateDataDto[];
}