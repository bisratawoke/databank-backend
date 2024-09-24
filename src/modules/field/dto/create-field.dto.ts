import { IsNotEmpty, IsBoolean, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFieldDto {
  @ApiProperty({ description: 'The name of the field' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The ID of the field type', type: String })
  @IsNotEmpty()
  @IsMongoId()
  type: string;

  @ApiProperty({ description: 'Indicates if the field is filtered', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  filtered?: boolean = false;
}
