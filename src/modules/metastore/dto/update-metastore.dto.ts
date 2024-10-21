import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class UpdateMetastoreDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyword?: string[];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  modified_date?: string;

  @IsOptional()
  @IsDateString()
  created_date?: string;
}
