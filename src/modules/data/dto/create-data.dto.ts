import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDataDto {
    @IsNotEmpty()
    @IsString()
    readonly value: string;

    @IsNotEmpty()
    @IsString()
    readonly type: string; // FieldType ID
}
