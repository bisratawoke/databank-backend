import {
  IsString,
  IsOptional,
  IsDate,
  IsEnum,
  IsObject,
} from 'class-validator';

enum PUBLICATION_TYPE {
  PUBLIC,
  INTERNAL,
  FOR_SALE,
}

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

  @IsObject()
  @IsOptional()
  metadata: any;

  @IsOptional()
  _id?: string;

  @IsEnum(PUBLICATION_TYPE)
  @IsOptional()
  publicationType?: PUBLICATION_TYPE;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
