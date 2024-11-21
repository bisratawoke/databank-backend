import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePublicationStatusDto {
  @ApiPropertyOptional({
    type: 'string',
    description: 'status',
    example: 'Rejected',
  })
  @IsString()
  @IsOptional()
  status?: string;
}
