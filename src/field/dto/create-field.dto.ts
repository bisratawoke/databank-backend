import { IsNotEmpty, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class CreateFieldDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  type: string;

  @IsOptional()
  @IsBoolean()
  filtered?: boolean = false;
}
