import { IsString, IsOptional, IsDate } from "class-validator";

export class UpdatePublicationDto {
    @IsString()
    @IsOptional()
    fileName?: string;

    @IsString()
    @IsOptional()
    bucketName?: string;

    @IsString()
    @IsOptional()
    permanentLink?: string;

    @IsDate()
    @IsOptional()
    uploadDate?: Date;

    @IsString()
    @IsOptional()
    metastoreId?: string;
}