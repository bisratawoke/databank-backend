import { IsNotEmpty, IsString, IsDate, IsArray } from 'class-validator';

export class CreateReportDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsDate()
    readonly start_date: Date;

    @IsNotEmpty()
    @IsDate()
    readonly end_date: Date;

    @IsArray()
    readonly fields: string[];  // List of IDs

    @IsArray()
    readonly data: string[];   // List of IDs
}
