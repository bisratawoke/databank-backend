import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateMetastoreDto {
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

  @IsNotEmpty()
  @IsDateString()
  modified_date: string;

  @IsNotEmpty()
  @IsDateString()
  created_date: string;
}
