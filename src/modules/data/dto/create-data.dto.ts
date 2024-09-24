import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDataDto {
    @ApiProperty({ description: 'The value of the data entry' })
    @IsNotEmpty()
    @IsString()
    readonly value: string;

    @ApiProperty({ description: 'The ID of the FieldType associated with this data entry' })
    @IsNotEmpty()
    @IsString()
    readonly type: string;
}
