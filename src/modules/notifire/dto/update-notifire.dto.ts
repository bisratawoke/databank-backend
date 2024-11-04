import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateNotifireDto {
  @ApiProperty({
    description: 'Updated message of the notifire',
    example: 'Updated message',
    required: false,
  })
  @IsOptional()
  readonly message?: string;

  @ApiProperty({
    description: 'Whether the notification has been seen',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly seen?: boolean;

  @ApiProperty({
    description: 'Updated User ID associated with the notifire',
    example: '60d21b4667d0d8992e610c85',
    required: false,
  })
  @IsOptional()
  readonly user?: Types.ObjectId;
}
