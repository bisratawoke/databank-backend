import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DataDto {

    @ApiProperty({ description: 'The ID of the FieldType associated with this data entry' })
    @IsNotEmpty()
    @IsString()
    readonly field: string;

    @ApiProperty({ description: 'The actual value of the data entry', required: false })
    @IsOptional()
    @IsString()
    readonly value?: string;

}
