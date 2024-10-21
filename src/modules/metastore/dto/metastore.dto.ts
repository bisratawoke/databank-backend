// src/modules/metastore/dto/create-metastore.dto.ts
import { IsString, IsArray, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class MetastoreDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsArray()
    @IsString({ each: true })
    keyword: string[];

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsNumber()
    size: number;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsOptional()
    _id?: string;
}
