// src/modules/publication/dto/create-publication.dto.ts
import { IsString, IsOptional, IsDate, IsObject } from 'class-validator';

export class PublicationDto {
    @IsString()
    fileName: string;

    @IsString()
    bucketName: string;

    @IsString()
    @IsOptional()
    permanentLink?: string;

    @IsDate()
    @IsOptional()
    uploadDate?: Date;

    @IsObject()
    @IsOptional()
    metaStoreId?: string;

    @IsOptional()
    _id?: string;
}
