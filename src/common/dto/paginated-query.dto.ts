import { Type } from "class-transformer";
import { IsOptional, IsNumber, Min, Max, IsString, IsIn } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';

    //      @IsOptional()
    // @IsNumber()
    // @Type(() => Number)
    // @Min(1)
    // fieldsPage?: number = 1;

    // @IsOptional()
    // @IsNumber()
    // @Type(() => Number)
    // @Min(1)
    // @Max(100)
    // fieldsLimit?: number = 10;

    // @IsOptional()
    // @IsNumber()
    // @Type(() => Number)
    // @Min(1)
    // dataPage?: number = 1;

    // @IsOptional()
    // @IsNumber()
    // @Type(() => Number)
    // @Min(1)
    // @Max(100)
    // dataLimit?: number = 10;
}


