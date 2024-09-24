import { IsNotEmpty, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class UpdateFieldDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsMongoId()
  type?: string;

  @IsOptional()
  @IsBoolean()
  filtered?: boolean;
}
