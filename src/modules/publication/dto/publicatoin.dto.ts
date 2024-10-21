import { IsString, IsOptional, IsDate, IsObject } from 'class-validator';
import { MetastoreDto } from 'src/modules/metastore/dto/metastore.dto';

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

    // Metadata object representing the metastore details
    @IsObject()
    @IsOptional()
    metaStoreId?: string;

    @IsObject()
    @IsOptional()
    metadata: any;

    @IsOptional()
    _id?: string;
}
