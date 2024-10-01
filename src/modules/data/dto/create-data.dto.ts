import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDataDto {

    @ApiProperty({ description: 'The ID of the FieldType associated with this data entry' })
    @IsNotEmpty()
    @IsString()
    readonly field: string;

    @ApiProperty({ description: 'The actual value of the data entry', required: false })
    @IsOptional()
    @IsString()
    readonly value?: string;

}


export class CreateMultipleDataDto {
    @ApiProperty({ description: 'An arry of CreateDataDto', type: [CreateDataDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateDataDto)
    readonly dataEntries: CreateDataDto[];
}

