import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchSubCategoryDto {
  @ApiPropertyOptional({
    description: 'Search by subcategory name',
    example: 'Smartphones',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  readonly name?: string;
}
