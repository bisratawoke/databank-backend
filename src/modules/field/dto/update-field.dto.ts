import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class UpdateFieldDto {
  @ApiPropertyOptional({ description: 'The name of the field' })

  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'The ID of the field type', type: String })

  @IsOptional()
  @IsMongoId()
  type?: string;

  @ApiPropertyOptional({ description: 'Indicates if the field is filtered', default: false, required: false })

  @IsOptional()
  @IsBoolean()
  filtered?: boolean;
}